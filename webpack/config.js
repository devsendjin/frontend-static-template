// BrowserSync reloading the whole page instead of injecting CSS
// https://stackoverflow.com/questions/47743919/browsersync-reloading-the-whole-page-instead-of-injecting-css

const Path = require('path');
const fs = require('fs');

const MODE = process.env.NODE_ENV || 'development';
const __DEV__ = MODE === 'development';
const __PROD__ = MODE === 'production';

const isServerRunning = process.env.WEBPACK_DEV_SERVER === 'true';
const shouldExtractCss = __PROD__ || (__DEV__ && !isServerRunning);
const usePug = true;

const root = process.cwd();

// without trailing slash
const paths = {
  src: Path.join(root, 'src'),
  dist: Path.join(root, 'dist'),
  assets: Path.join(root, 'src/assets'),
  html: Path.join(root, 'src/html'),
  pug: Path.join(root, 'src/pug/pages'),
  root,
};

const host = 'localhost';
const port = 8080;
const browserSyncPort = 3333;

const templateFiles = usePug ? fs.readdirSync(paths.pug) : fs.readdirSync(paths.html);

module.exports = {
  // mode
  MODE,
  __DEV__,
  __PROD__,

  // paths
  paths,

  // files
  templateFiles,

  //other
  host,
  port,
  browserSyncPort,
  isServerRunning,
  shouldExtractCss,
}
