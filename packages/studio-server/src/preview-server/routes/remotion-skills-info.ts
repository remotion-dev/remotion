import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import type {
	GetRemotionSkillsInfoRequest,
	GetRemotionSkillsInfoResponse,
} from '@remotion/studio-shared';
import {getRemotionSkillsDirectories} from '../../detect-outdated-remotion-skills';
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
	const skills = remotionSkillNames.map((name) => ({
		name,
		installedInProject: existsSync(
			path.join(skillsDirectories.project, name, 'SKILL.md'),
		),
		installedGlobally: existsSync(
			path.join(skillsDirectories.global, name, 'SKILL.md'),
		),
	}));
	const isSkillAvailable = (skillName: RemotionSkillName) => {
		const skill = skills.find(({name}) => name === skillName);
		return Boolean(skill?.installedInProject || skill?.installedGlobally);
	};

	return {
		remotionUpgradeSkillAvailable: isSkillAvailable('remotion-upgrade'),
		remotionInteractivitySkillAvailable: isSkillAvailable(
			'remotion-interactivity',
		),
		skills,
	};
};

export const remotionSkillsInfoHandler: ApiHandler<
	GetRemotionSkillsInfoRequest,
	GetRemotionSkillsInfoResponse
> = ({remotionRoot}) => Promise.resolve(getRemotionSkillsInfo({remotionRoot}));
