import {findClosestFolderWithItem, getConfig, internalBundle} from './bundle';
import {indexHtml} from './index-html';
import {readRecursively} from './read-recursively';
import {createRspackCompiler, rspackConfig} from './rspack-config';
import {WatchIgnoreNextChangePlugin} from './watch-ignore-next-change-plugin';
import {cacheExists, clearCache} from './webpack-cache';
import {webpackConfig} from './webpack-config';
import esbuild = require('esbuild');
import webpack = require('webpack');

export const BundlerInternals = {
	esbuild,
	webpackConfig,
	rspackConfig,
	createRspackCompiler,
	indexHtml,
	cacheExists,
	clearCache,
	getConfig,
	readRecursively,
	findClosestFolderWithItem,
	internalBundle,
};

export type {GitSource} from '@remotion/studio-shared';
export {bundle, BundleOptions, MandatoryBundleInternalsOptions} from './bundle';
export {WebpackConfiguration, WebpackOverrideFn} from './webpack-config';
export {WatchIgnoreNextChangePlugin};
export {webpack};
