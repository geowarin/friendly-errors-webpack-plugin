const FriendlyErrorsWebpackPlugin = require("../../../index");

class WebpackPluginWithError {
  apply(compiler) {
    compiler.hooks.run.tap("WebpackPluginWithError", compilation => {
      throw new Error("Error");
    });
  }
}

module.exports = {
  mode: "development",
  entry: __dirname + "/index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  plugins: [new FriendlyErrorsWebpackPlugin(), new WebpackPluginWithError()]
};
