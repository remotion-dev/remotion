import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {getPackageManager, lockFilePaths} from './get-package-manager';
import {startServer} from './start-server';
import {cacheExists, clearCache} from './webpack-cache';
import esbuild = require('esbuild');
import mimeTypes from 'mime-types';

export const BundlerInternals = {
	startServer,
	cacheExists,
	clearCache,
	getLatestRemotionVersion,
	getPackageManager,
	lockFilePaths,
	esbuild,
	mimeTypes,
};

export type {ProjectInfo} from './project-info';

export {bundle} from './bundler';
export {PackageManager} from './get-package-manager';
