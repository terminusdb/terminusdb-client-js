const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')

var PACKAGE = require('./package.json')
var version = `v${PACKAGE.version}`

require('@babel/register')
// Webpack Configuration
const config = {
  // Entry
  entry: path.resolve(__dirname, 'index.js'),
  // Output
  output: {
    filename: 'terminusdb-client.min.js',
    sourceMapFilename: 'terminusdb-client.min.js.map',
    libraryTarget: 'umd',
    library: 'TerminusDBClient',
    globalObject: 'this',
  },
  // Loaders
  module: {
    rules: [
      // JavaScript/JSX Files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  devtool: 'source-map',
  // Plugins
  resolve: {
    fallback: {
      "https": false,
    }
  }
}

module.exports = function(env, argv) {
  if (argv.mode === 'development') {
    config.watch = true
  }

  if (argv.mode === 'production') {
    config.plugins = [
      new HtmlWebPackPlugin({
        template: './index.html',
        filename: 'index.html',
      }),
    ]
  }

  return config
}

// Exports
//module.exports = config;
