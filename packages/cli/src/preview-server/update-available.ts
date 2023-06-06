import semver from 'semver';
import {getLatestRemotionVersion} from '../get-latest-remotion-version';
import {getPackageManager} from './get-package-manager';
import type {UpdateAvailableResponse} from './render-queue/job';

const isUpdateAvailable = async ({
	remotionRoot,
	currentVersion,
}: {
	remotionRoot: string;
	currentVersion: string;
}): Promise<UpdateAvailableResponse> => {
	const latest = await getLatestRemotionVersion();
	const pkgManager = getPackageManager(remotionRoot, undefined);

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

export const isUpdateAvailableWithTimeout = (remotionRoot: string) => {
	const version = getRemotionVersion();
	const threeSecTimeout = new Promise<UpdateAvailableResponse>((resolve) => {
		const pkgManager = getPackageManager(remotionRoot, undefined);
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
		isUpdateAvailable({remotionRoot, currentVersion: version}),
	]);
};
