const FriendlyErrorsWebpackPlugin = require('../index');

module.exports = {
  entry: __dirname + "/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: __dirname
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: ['react'],
        },
        exclude: /node_modules/
      }
    ]
  }
};