const webpackMerge = require('webpack-merge');
const webpack = require('webpack');

// plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const LodashPlugin = require('lodash-webpack-plugin');
// const WebappWebpackPlugin = require('webapp-webpack-plugin');
const RetryPlugin = require('webpack-retry-load-plugin');

// config
const getBaseConfig = require('./common.config');
const { PROD } = require('../../const');

const configureCleanWebpack = ({ distDir: root }) => {
  return {
    root,
    verbose: false,
    dry: false,
  };
};
// const configureWebapp = ({ cacheDir, webappConfig }) => {
//   return { cache: path.resolve(cacheDir, 'webapp-webpack-plugin'), ...webappConfig };
// };

module.exports = options => {
  const { sourceMap, publicPath, distDir } = options;
  const config = webpackMerge(getBaseConfig(options), {
    mode: PROD,
    devtool: sourceMap ? 'source-map' : 'none',
    output: {
      publicPath,
      path: distDir,
      filename: '[name]_[chunkhash].js',
    },
    plugins: [
      options.retry && new RetryPlugin(options.retry),
      // 支持lodash包 按需引用
      new LodashPlugin(),
      new CleanWebpackPlugin('*', configureCleanWebpack(options)),
      new MiniCssExtractPlugin({
        filename: '[name]_[contenthash].css',
      }),
      new webpack.HashedModuleIdsPlugin({
        hashDigestLength: 6,
      }),
    ].filter(Boolean),
  });
  // if (options.webappConfig) {
  // config.plugins.push(
  //   new WebappWebpackPlugin(configureWebapp(options)),
  //   // 微信QQ分享图标支持
  //   new class {
  //     apply(compiler) {
  //       compiler.hooks.make.tapAsync('A', (compilation, callback) => {
  //         // 修复分析模式没有该hooks
  //         compilation.hooks.webappWebpackPluginBeforeEmit
  //           && compilation.hooks.webappWebpackPluginBeforeEmit.tapAsync('B', (result, _callback) => {
  //             const { html } = result;
  //             const reg = /<link rel="apple-touch-icon" sizes="152x152" href="([^"]*)">/;
  //             const url = html.match(reg)[1];
  //             result.html = `<meta itemprop="image" content="${url}" />${result.html}`;
  //             return _callback(null, result);
  //           });
  //         return callback();
  //       });
  //     }
  //   }()
  // );
  // }
  return config;
};
