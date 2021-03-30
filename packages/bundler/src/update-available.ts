import latestVersion from 'latest-version';
import semver from 'semver';

export type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
};

const isUpdateAvailable = async (currentVersion: string): Promise<Info> => {
	const latest = await latestVersion('@remotion/bundler');
	return {
		updateAvailable: semver.lt(currentVersion, latest),
		currentVersion,
		latestVersion: latest,
		timedOut: false,
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
			});
		}, 3000);
	});
	return Promise.race([threeSecTimeout, isUpdateAvailable(version)]);
};
