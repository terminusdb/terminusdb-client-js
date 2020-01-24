const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
require("@babel/register");
// Webpack Configuration
const config = {

  // Entry
  entry: path.resolve(__dirname, 'index.js'),
  // Output
  output: {
    path: path.resolve(__dirname, 'public_pages/dist'),
    filename: 'terminus-client.min.js',
    sourceMapFilename: 'terminus-client.min.js.map',
    libraryTarget: 'var',
    library: 'TerminusClient',
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

};


module.exports = function(env, argv){

  if (argv.mode === 'development') {
      config.watch=true
  }

  if (argv.mode === 'production') {
    config.plugins= [
      new HtmlWebPackPlugin({
        template: "./index.html",
        filename: "index.html"
      })
    ]
  }

  return config;
};

// Exports
//module.exports = config;
