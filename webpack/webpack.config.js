// webpack pug example
// https://github.com/jantimon/html-webpack-plugin/blob/main/examples/pug-loader/webpack.config.js

const Path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const utils = require('./utils');
const utilsWebpack = require('./utils.webpack');
const config = require('./config');

const copyWebpackPlugin = () => {
  let patterns = [
    !utils.isDirEmpty(`${config.paths.assets}/images`) &&
    { from: `${config.paths.assets}/images`, to: `${config.paths.dist}/images` },
    !utils.isDirEmpty(`${config.paths.assets}/fonts`) &&
    { from: `${config.paths.assets}/fonts`, to: `${config.paths.dist}/fonts` },
    !utils.isDirEmpty(`${config.paths.src}/static`) &&
    { from: `${config.paths.src}/static/lazysizes.min.js`, to: `${config.paths.dist}/js` },
    {
      from: `${config.paths.src}/static`,
      to: `${config.paths.dist}`,
      // https://bit.ly/3y03Iy8 - node-glob
      // https://bit.ly/3qsoCU2 - globOptions
      globOptions: {
        ignore: [`${config.paths.src}/static/*.js`],
      },
    },
  ].filter(Boolean);

  const hasFilesToCopy = patterns.length !== 0;

  return {
    options: { patterns },
    hasFilesToCopy,
  }
};
const copyWebpackPluginConfig = copyWebpackPlugin();

const cssLoaders = ({ sourceMap = true } = {}) => {
  return [
    !config.shouldExtractCss && "style-loader",
    config.shouldExtractCss && {
      loader: MiniCssExtractPlugin.loader,
      options: {
        esModule: false,
      },
    },
    {
      loader: "css-loader",
      options: { sourceMap },
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            require('postcss-preset-env')({
              stage: 2
            }),
            // require('autoprefixer'), // included in postcss-preset-env
            require('css-mqpacker')({
              sort: true
            }),
            require('cssnano')({
              preset: [
                'default', {
                  discardComments: {
                    removeAll: true
                  }
                }
              ]
            }),
          ],
        },
      },
    },
  ].filter(Boolean)
};

module.exports = () => {
  return {
    mode: config.MODE,
    entry: {
      app: Path.join(config.paths.assets, 'js'),
    },
    output: {
      filename: 'js/[name].[fullhash:6].js',
      path: config.paths.dist,
      publicPath: "/",
    },
    optimization: utilsWebpack.optimization(),
    // stats: {
    //   children: true,
    // },
    devtool: config.__DEV__ ? 'eval-cheap-module-source-map' : false,
    devServer: config.isServerRunning ? {
      // lazy: true,
      host: config.host,
      port: config.port,
      contentBase: config.paths.dist,
      watchContentBase: true,
      hot: true,
      historyApiFallback: true,
      hotOnly: true,
      open: false,
      writeToDisk: false,
      overlay: {
        warning: true,
        errors: true,
      }
    } : {},
    module: {
      rules: [
        {
          test: /\.pug$/,
          loader: 'pug-loader',
          exclude: '/node_modules/',
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: '/node_modules/',
        },
        {
          test: /\.scss$/,
          use: [
            ...cssLoaders({ sourceMap: false }),
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sourceMap: true,
                additionalData:
                  `@import "styles/abstracts/_config.scss";
                   @import "styles/abstracts/_functions.scss";
                   @import "styles/abstracts/_css-lock.scss";
                   @import "styles/abstracts/_mixins.scss";`,
                sassOptions: {
                  outputStyle: 'expanded',
                }
              },
            },
            {
              loader: require.resolve('sass-bulk-import-loader')
            }
          ],
        },
        {
          test: /\.css$/,
          use: cssLoaders(),
        },
      ],
    },
    resolve: {
      alias: {
        "~": config.paths.src,
        "styles": `${config.paths.assets}/scss`,
      },
    },
    plugins: [
      config.shouldExtractCss && new MiniCssExtractPlugin({
        filename: 'css/[name].[fullhash:6].css',
        chunkFilename: 'css/[name].[fullhash:6].css',
      }),
      copyWebpackPluginConfig.hasFilesToCopy && new CopyWebpackPlugin(copyWebpackPluginConfig.options),
      ...config.templateFiles.map(page => new HtmlWebpackPlugin({
          template: Path.join(config.paths.pug, page),
          filename: `${page.replace(/\.pug/, '.html')}`,
          inject: false,
        })
      ),
      config.isServerRunning && new BrowserSyncPlugin({
        host: config.host,
        port: config.browserSyncPort,
        proxy: `http://${config.host}:${config.port}`,
        open: true,
        reloadOnRestart: true,
        notify: false,
        injectChanges: true, // not working
      })
    ].filter(Boolean),
  }
}
