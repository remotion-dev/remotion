import {existsSync} from 'fs';
import {join} from 'path';
import semver from 'semver';
import {getLatestRemotionVersion} from './get-latest-remotion-version';

type PackageManager = 'npm' | 'yarn' | 'unknown';

type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager;
};

const packageManager = existsSync(join(__dirname, '..', 'yarn.lock'))
	? 'yarn'
	: existsSync(join(__dirname, '..', 'package-lock.json'))
	? 'npm'
	: 'unknown';

const isUpdateAvailable = async (currentVersion: string): Promise<Info> => {
	const latest = await getLatestRemotionVersion();
	return {
		updateAvailable: semver.lt(currentVersion, latest),
		currentVersion,
		latestVersion: latest,
		timedOut: false,
		packageManager,
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
				packageManager,
			});
		}, 3000);
	});
	return Promise.race([threeSecTimeout, isUpdateAvailable(version)]);
};
