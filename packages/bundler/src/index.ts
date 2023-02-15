import vite from 'vite';
import {getConfig} from './bundle';
import {indexHtml} from './index-html';
import {readRecursively} from './read-recursively';
import {cacheExists, clearCache} from './webpack-cache';
import {viteConfig} from './webpack-config';
import esbuild = require('esbuild');

export const BundlerInternals = {
	esbuild,
	indexHtml,
	cacheExists,
	clearCache,
	getConfig,
	readRecursively,
	viteConfig,
	vite,
};

export {bundle, BundleOptions, LegacyBundleOptions} from './bundle';
