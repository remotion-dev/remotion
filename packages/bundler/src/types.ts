import webpack = require('webpack');

export type WebpackConfiguration = webpack.Configuration;

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration
) => WebpackConfiguration;
