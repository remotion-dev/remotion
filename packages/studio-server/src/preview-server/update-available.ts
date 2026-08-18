import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import type {UpdateAvailableResponse} from '@remotion/studio-shared';
import semver from 'semver';
import {detectOutdatedRemotionSkills} from '../detect-outdated-remotion-skills';
import {getLatestRemotionVersion} from '../get-latest-remotion-version';
import type {RemotionSkillName} from '../remotion-skill-names';
import {getPackageManager} from './get-package-manager';

const getSkillsUpdateInfo = ({
	remotionRoot,
	currentVersion,
	homeDirectory = homedir(),
}: {
	remotionRoot: string;
	currentVersion: string;
	homeDirectory?: string;
}) => {
	const skills = detectOutdatedRemotionSkills({
		cwd: remotionRoot,
		currentVersion,
		homeDirectory,
	});
	const skillsDirectories = [
		skills.project.skillsDirectory,
		skills.global.skillsDirectory,
	];
	const isSkillAvailable = (skillName: RemotionSkillName) =>
		skillsDirectories.some((skillsDirectory) =>
			existsSync(path.join(skillsDirectory, skillName, 'SKILL.md')),
		);

	return {
		skillsUpdateAvailable: skills.project.type === 'outdated',
		remotionUpgradeSkillAvailable: isSkillAvailable('remotion-upgrade'),
		remotionInteractivitySkillAvailable: isSkillAvailable(
			'remotion-interactivity',
		),
	};
};

export const isUpdateAvailable = async ({
	remotionRoot,
	currentVersion,
	logLevel,
	getLatestVersion,
	homeDirectory = homedir(),
}: {
	remotionRoot: string;
	currentVersion: string;
	logLevel: LogLevel;
	getLatestVersion: (() => Promise<string>) | null;
	homeDirectory?: string;
}): Promise<UpdateAvailableResponse> => {
	const latest = await (getLatestVersion ?? getLatestRemotionVersion)();
	const skillsUpdateInfo = getSkillsUpdateInfo({
		remotionRoot,
		currentVersion,
		homeDirectory,
	});

	const pkgManager = getPackageManager({
		remotionRoot,
		packageManager: undefined,
		dirUp: 0,
		logLevel,
	});

	return {
		updateAvailable: semver.lt(currentVersion, latest),
		...skillsUpdateInfo,
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
	const skillsUpdateInfo = getSkillsUpdateInfo({
		remotionRoot,
		currentVersion: version,
	});
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
				...skillsUpdateInfo,
				timedOut: true,
				packageManager:
					pkgManager === 'unknown' ? 'unknown' : pkgManager.manager,
			});
		}, 3000);
	});
	return Promise.race([
		threeSecTimeout,
		isUpdateAvailable({
			remotionRoot,
			currentVersion: version,
			logLevel,
			getLatestVersion: null,
		}),
	]);
};
