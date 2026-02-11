import type {LogLevel} from '@remotion/renderer';
import type {UpdateAvailableResponse} from '@remotion/studio-shared';
import semver from 'semver';
import {getLatestRemotionVersion} from '../get-latest-remotion-version';
import {getPackageManager} from './get-package-manager';

const isUpdateAvailable = async ({
	remotionRoot,
	currentVersion,
	logLevel,
}: {
	remotionRoot: string;
	currentVersion: string;
	logLevel: LogLevel;
}): Promise<UpdateAvailableResponse> => {
	const latest = await getLatestRemotionVersion();

	const pkgManager = getPackageManager({
		remotionRoot,
		packageManager: undefined,
		dirUp: 0,
		logLevel,
	});

	return {
		updateAvailable: semver.lt(currentVersion, latest),
		currentVersion,
		latestVersion: latest,
		timedOut: false,
		packageManager: pkgManager === 'unknown' ? 'unknown' : pkgManager.manager,
	};
};

export const getRemotionVersion = () => {
	// careful when refactoring this file, path must be adjusted
	const packageJson = require('../../package.json');

	const {version} = packageJson;

	return version;
};

export const isUpdateAvailableWithTimeout = (
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const version = getRemotionVersion();
	const threeSecTimeout = new Promise<UpdateAvailableResponse>((resolve) => {
		const pkgManager = getPackageManager({
			remotionRoot,
			packageManager: undefined,
			dirUp: 0,
			logLevel,
		});
		setTimeout(() => {
			resolve({
				currentVersion: version,
				latestVersion: version,
				updateAvailable: false,
				timedOut: true,
				packageManager:
					pkgManager === 'unknown' ? 'unknown' : pkgManager.manager,
			});
		}, 3000);
	});
	return Promise.race([
		threeSecTimeout,
		isUpdateAvailable({remotionRoot, currentVersion: version, logLevel}),
	]);
};
