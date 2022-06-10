import semver from 'semver';
import {getLatestRemotionVersion} from '../get-latest-remotion-version';
import {getPackageManager, PackageManager} from './get-package-manager';

type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager | 'unknown';
};

const isUpdateAvailable = async (currentVersion: string): Promise<Info> => {
	const latest = await getLatestRemotionVersion();
	return {
		updateAvailable: semver.lt(currentVersion, latest),
		currentVersion,
		latestVersion: latest,
		timedOut: false,
		packageManager: getPackageManager(),
	};
};

export const isUpdateAvailableWithTimeout = () => {
	const packageJson = require('../package.json');

	const {version} = packageJson;
	const threeSecTimeout = new Promise<Info>((resolve) => {
		setTimeout(() => {
			resolve({
				currentVersion: version,
				latestVersion: version,
				updateAvailable: false,
				timedOut: true,
				packageManager: getPackageManager(),
			});
		}, 3000);
	});
	return Promise.race([threeSecTimeout, isUpdateAvailable(version)]);
};
