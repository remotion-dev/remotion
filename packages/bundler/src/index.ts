import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {getPackageManager, lockFilePaths} from './get-package-manager';
import {overrideWebpackConfig} from './override-webpack';
import {startServer} from './start-server';
import {cacheExists, clearCache} from './webpack-cache';

export const BundlerInternals = {
	startServer,
	cacheExists,
	clearCache,
	getLatestRemotionVersion,
	getPackageManager,
	lockFilePaths,
};

export {bundle} from './bundler';
export {overrideWebpackConfig};
export {ProjectInfo} from './project-info';
export {PackageManager} from './get-package-manager';
