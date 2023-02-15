import {getConfig} from './bundle';
import {indexHtml} from './index-html';
import {readRecursively} from './read-recursively';
import type {WebpackOverrideFn} from './types';
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
	readRecursively,
};

export {bundle, BundleOptions, LegacyBundleOptions} from './bundle';
export {WebpackConfiguration, WebpackOverrideFn} from './types';
export {webpack};

export type WebpackConfiguration = webpack.Configuration;
