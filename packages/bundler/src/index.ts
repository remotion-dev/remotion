import {getConfig} from './bundle';
import {indexHtml} from './index-html';
import {cacheExists, clearCache} from './webpack-cache';
import {webpackConfig} from './webpack-config';
import esbuild = require('esbuild');
import webpack = require('webpack');

export const BundlerInternals = {
	esbuild,
	webpackConfig,
	indexHtml,
	cacheExists,
	clearCache,
	getConfig,
};

export {bundle, BundleOptions, LegacyBundleOptions} from './bundle';
export {webpack};

export type WebpackConfiguration = webpack.Configuration;
