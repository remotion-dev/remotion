import semver from 'semver';
import {getLatestRemotionVersion} from '../get-latest-remotion-version';
import type { PackageManager} from './get-package-manager';
import {getPackageManager} from './get-package-manager';

type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager | 'unknown';
};

const isUpdateAvailable = async (currentVersion: string): Promise<Info> => {
	const latest = await getLatestRemotionVersion();
	const pkgManager = getPackageManager();

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

export const isUpdateAvailableWithTimeout = () => {
	const version = getRemotionVersion();
	const threeSecTimeout = new Promise<Info>((resolve) => {
		const pkgManager = getPackageManager();
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
	return Promise.race([threeSecTimeout, isUpdateAvailable(version)]);
};
