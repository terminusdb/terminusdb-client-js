const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
require("babel-register");
// Webpack Configuration
const config = {
  
  // Entry
  entry: path.resolve(__dirname, 'index.js'),
  // Output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'woql-client.min.js',
    sourceMapFilename: 'woql-client.min.js.map',
    libraryTarget: 'var',
    library: 'TerminusDB',
  },
  node: {
    process: false
  },
  // Loaders
  module: {
    rules : [
      // JavaScript/JSX Files
      {
        test: /\.js$/,
        exclude: /node_modules/,
         loader: 'babel-loader'
      }
    ]
  },
  devtool :'source-map',
  // Plugins
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "index.html"
    })
  ]
};
// Exports
module.exports = config;