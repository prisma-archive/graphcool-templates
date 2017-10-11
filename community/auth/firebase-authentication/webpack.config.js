const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: ["babel-polyfill", path.join(__dirname, "src", "handler.js")],
  output: {
    path: path.join(__dirname, ".webpack"),
    library: "firebase-graphcool-authenticator",
    libraryTarget: "commonjs2",
    filename: "src/handler.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ],
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.join(__dirname, "src")],
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015", "flow"],
          plugins: ["transform-regenerator", "transform-async-to-generator"]
        }
      },
      {
        test: /\.json/,
        include: [path.join(__dirname, "src")],
        loader: "json-loader"
      }
    ]
  }
};
