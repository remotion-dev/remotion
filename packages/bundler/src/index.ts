import {findClosestFolderWithItem, getConfig, internalBundle} from './bundle';
import {indexHtml} from './index-html';
import {readRecursively} from './read-recursively';
import {createRspackCompiler, rspackConfig} from './rspack-config';
import {resolveStudioBundlerAssetPaths} from './studio-asset-paths';
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
	resolveStudioBundlerAssetPaths,
};

export type {GitSource} from '@remotion/studio-shared';
export {
	bundle,
	BundleOptions,
	LegacyBundleOptions,
	MandatoryLegacyBundleOptions,
} from './bundle';
export type {StudioBundlerAssetPaths} from './studio-asset-paths';
export {WebpackConfiguration, WebpackOverrideFn} from './webpack-config';
export {webpack};
