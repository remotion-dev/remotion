import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {getPackageManager, lockFilePaths} from './get-package-manager';
import {startServer} from './start-server';
import {cacheExists, clearCache} from './webpack-cache';
import esbuild = require('esbuild');

export const BundlerInternals = {
	startServer,
	cacheExists,
	clearCache,
	getLatestRemotionVersion,
	getPackageManager,
	lockFilePaths,
	esbuild,
};

export {bundle} from './bundle';
export {PackageManager} from './get-package-manager';
export type {ProjectInfo} from './project-info';
