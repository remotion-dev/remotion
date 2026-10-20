import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import type {
	GetRemotionSkillsInfoRequest,
	GetRemotionSkillsInfoResponse,
	OpenRemotionSkillRequest,
} from '@remotion/studio-shared';
import {VERSION} from 'remotion/version';
import semver from 'semver';
import {
	getRemotionSkillsDirectories,
	readRemotionSkill,
} from '../../detect-outdated-remotion-skills';
import {openDirectoryInFinder} from '../../open-directory-in-finder';
import {
	remotionSkillNames,
	type RemotionSkillName,
} from '../../remotion-skill-names';
import type {ApiHandler} from '../api-types';

export const getRemotionSkillsInfo = ({
	remotionRoot,
	homeDirectory = homedir(),
}: {
	remotionRoot: string;
	homeDirectory?: string;
}): GetRemotionSkillsInfoResponse => {
	const skillsDirectories = getRemotionSkillsDirectories({
		cwd: remotionRoot,
		homeDirectory,
	});
	const installations = remotionSkillNames.flatMap((name) => {
		return (['project', 'global'] as const).flatMap((scope) => {
			const {installed, version} = readRemotionSkill(
				path.join(skillsDirectories[scope], name, 'SKILL.md'),
			);
			if (!installed) {
				return [];
			}

			return [
				{
					name,
					scope,
					version,
					outdated:
						version === null ||
						semver.valid(version) === null ||
						semver.lt(version, VERSION),
				},
			];
		});
	});
	const skills = remotionSkillNames.map((name) => ({
		name,
		installedInProject: installations.some(
			(installation) =>
				installation.name === name && installation.scope === 'project',
		),
		installedGlobally: installations.some(
			(installation) =>
				installation.name === name && installation.scope === 'global',
		),
	}));
	const isSkillAvailable = (skillName: RemotionSkillName) => {
		const skill = skills.find(({name}) => name === skillName);
		return Boolean(skill?.installedInProject || skill?.installedGlobally);
	};

	const restartSkillDirectories = [skillsDirectories.global];
	let directory = path.resolve(remotionRoot);
	while (true) {
		restartSkillDirectories.push(path.join(directory, '.agents', 'skills'));
		const parent = path.dirname(directory);
		if (parent === directory || existsSync(path.join(directory, '.git'))) {
			break;
		}

		directory = parent;
	}

	const studioRestartSkill =
		(['remotion-studio', 'remotion-best-practices'] as const).find((name) =>
			restartSkillDirectories.some((skillsDirectory) =>
				existsSync(path.join(skillsDirectory, name, 'SKILL.md')),
			),
		) ?? null;

	return {
		studioServerStartedByAgent: Boolean(
			process.env.CURSOR_AGENT || process.env.CLAUDECODE === '1',
		),
		studioRestartSkill,
		remotionUpgradeSkillAvailable: isSkillAvailable('remotion-upgrade'),
		remotionInteractivitySkillAvailable: isSkillAvailable(
			'remotion-interactivity',
		),
		installations,
		skills,
	};
};

export const remotionSkillsInfoHandler: ApiHandler<
	GetRemotionSkillsInfoRequest,
	GetRemotionSkillsInfoResponse
> = ({remotionRoot}) => Promise.resolve(getRemotionSkillsInfo({remotionRoot}));

export const openRemotionSkillHandler: ApiHandler<
	OpenRemotionSkillRequest,
	void
> = ({remotionRoot, input: {skill, scope}}) => {
	if (!remotionSkillNames.some((name) => name === skill)) {
		throw new Error(`Unknown Remotion skill: ${JSON.stringify(skill)}`);
	}

	if (scope !== 'project' && scope !== 'global') {
		throw new Error(`Unknown skill scope: ${JSON.stringify(scope)}`);
	}

	const directories = getRemotionSkillsDirectories({
		cwd: remotionRoot,
		homeDirectory: homedir(),
	});
	const skillDirectory = path.join(directories[scope], skill);
	if (!existsSync(path.join(skillDirectory, 'SKILL.md'))) {
		throw new Error(
			`${skill} is not installed ${scope === 'global' ? 'globally' : 'in the project'}.`,
		);
	}

	return openDirectoryInFinder(skillDirectory, directories[scope]);
};
