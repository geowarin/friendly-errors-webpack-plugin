const FriendlyErrorsWebpackPlugin = require('../index');
const friendlyEslintFormatter = require('eslint-formatter-friendly')

module.exports = {
  entry: __dirname + "/index.tsx",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  stats:'none',
  plugins: [
    new FriendlyErrorsWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_module|dist)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react'],
            },
          },
          {
            loader: 'eslint-loader',
            options: {
            }
          },
        ],
      }
    ]
  }
};