
const FriendlyErrorsWebpackPlugin = require('../../../index');

module.exports = {
  entry: __dirname + "/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'missing-loader',
      },
    ]
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin()
  ]
};
