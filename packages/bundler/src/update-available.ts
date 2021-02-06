import latestVersion from 'latest-version';
import semver from 'semver';

export type Info = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
};

export const isUpdateAvailable = async (): Promise<Info> => {
	const packageJson = require('../package.json');
	const latest = await latestVersion('@remotion/bundler');
	const {version} = packageJson;
	return {
		updateAvailable: semver.lt(version, latest),
		currentVersion: version,
		latestVersion: latest,
	};
};
