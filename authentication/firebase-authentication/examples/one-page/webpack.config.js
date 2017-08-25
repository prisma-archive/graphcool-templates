const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js"
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "build"),
    historyApiFallback: true
  }
};
