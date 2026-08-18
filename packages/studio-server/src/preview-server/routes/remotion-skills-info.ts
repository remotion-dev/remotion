import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import type {
	GetRemotionSkillsInfoRequest,
	GetRemotionSkillsInfoResponse,
} from '@remotion/studio-shared';
import {getRemotionSkillsDirectories} from '../../detect-outdated-remotion-skills';
import type {RemotionSkillName} from '../../remotion-skill-names';
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
	const isSkillAvailable = (skillName: RemotionSkillName) =>
		Object.values(skillsDirectories).some((skillsDirectory) =>
			existsSync(path.join(skillsDirectory, skillName, 'SKILL.md')),
		);

	return {
		remotionUpgradeSkillAvailable: isSkillAvailable('remotion-upgrade'),
		remotionInteractivitySkillAvailable: isSkillAvailable(
			'remotion-interactivity',
		),
	};
};

export const remotionSkillsInfoHandler: ApiHandler<
	GetRemotionSkillsInfoRequest,
	GetRemotionSkillsInfoResponse
> = ({remotionRoot}) => Promise.resolve(getRemotionSkillsInfo({remotionRoot}));
