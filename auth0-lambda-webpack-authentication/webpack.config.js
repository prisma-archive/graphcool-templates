var webpack = require('webpack');
var path = require('path');
var nodeExternals = require('webpack-node-externals');
var BabiliPlugin = require('babili-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: [ 'babel-polyfill', './auth0.js' ],
	target: 'node',
	externals: [ nodeExternals(), 'aws-sdk' ],
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [ 'babel-loader' ],
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false,
		}),
		new BabiliPlugin(),
		new CopyWebpackPlugin([ { from: 'cert.pem', to: path.join(__dirname, '.webpack') } ]),
	],
	output: {
		libraryTarget: 'commonjs',
		path: path.join(__dirname, '.webpack'),
		filename: 'auth0.js',
	},
};
