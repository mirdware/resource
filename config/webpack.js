const path = require('path');
const config = require('../package.json');

module.exports = {
  entry: {
    resource: ['./src/' + config.name.substring(1) + '.js'],
    app: './app/app.js'
  },
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: './[name]/[name].min.js',
    library: config.name,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: require('./plugins'),
  module: require('./module'),
  optimization: require('./optimization'),
  devServer: {
    host: '0.0.0.0',
    allowedHosts: ['all'],
    hot:false,
    liveReload: true,
    open: true,
    port: 6969
  },
  devtool: 'source-map'
};
