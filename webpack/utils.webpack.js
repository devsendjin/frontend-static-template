const TerserPlugin = require("terser-webpack-plugin");
const config = require('./config');

const terserOptions = {
    parse: {
        html5_comments: false,
    },
    mangle: true,
    sourceMap: false, // false by default. Handled by 'gulp-sourcemaps'.
    compress: {
        defaults: true,
        drop_console: false, // false by default. Pass true to discard calls to console.* functions.
        keep_infinity: true, // false by default. Pass true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome.
        passes: 2, // 1 by default. The maximum number of times to run compress.
    },
    format: {
        comments: false, // "some" by default
        preamble: null, // null by default. When passed it must be a string and it will be prepended to the output literally. The source map will adjust for this text. Can be used to insert a comment containing licensing information, for example.
        quote_style: 3, // 0 by default. 3 - always use the original quotes.
        preserve_annotations: false, // false by default.
        ecma: 2019, // 5 by default. Desired EcmaScript standard version for output.
    },
    ecma: 2019, // 5 by default. Desired EcmaScript standard version for output.
    keep_classnames: false, // undefined by default.
    keep_fnames: false, // false by default.
    safari10: false, // false by default.
};

const optimization = () => {
    let options = {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: "vendors",
                    test: /node_modules/,
                    chunks: "all",
                    enforce: true,
                },
            },
        },
    };

    if (config.__PROD__) {
        options = {
            ...options,
            nodeEnv: config.MODE,
            runtimeChunk: false,
            minimize: true,
            sideEffects: true,
            concatenateModules: true,
            emitOnErrors: false,
            removeEmptyChunks: true,
            mergeDuplicateChunks: true,
            removeAvailableModules: true,
            providedExports: true,
            usedExports: true,
            minimizer: [
                new TerserPlugin({
                    exclude: /node_modules/,
                    extractComments: false,
                    terserOptions,
                })
            ],
        }
    }

    return options
}

module.exports = {
    optimization
};
