import {existsSync, readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import semver from 'semver';
import {remotionSkillNames} from './remotion-skill-names';
import type {RemotionSkillName} from './remotion-skill-names';

export type RemotionSkillsScope = 'project' | 'global';

export type RemotionSkillsStatus =
	| {
			type: 'not-installed';
			scope: RemotionSkillsScope;
			skillsDirectory: string;
	  }
	| {
			type: 'up-to-date';
			scope: RemotionSkillsScope;
			skillsDirectory: string;
	  }
	| {
			type: 'outdated';
			scope: RemotionSkillsScope;
			skillsDirectory: string;
			outdatedSkillNames: RemotionSkillName[];
	  };

export const parseRemotionSkillVersion = (contents: string): string | null => {
	const frontmatter = contents.match(
		/^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---(?:\r?\n|$)/,
	)?.groups?.frontmatter;
	if (!frontmatter) {
		return null;
	}

	return (
		frontmatter.match(
			/^version:\s*(?<quote>['"]?)(?<version>[^\s'"]+)\k<quote>\s*$/m,
		)?.groups?.version ?? null
	);
};

const readRemotionSkill = (
	skillFile: string,
): {installed: boolean; version: string | null} => {
	if (!existsSync(skillFile)) {
		return {installed: false, version: null};
	}

	try {
		return {
			installed: true,
			version: parseRemotionSkillVersion(readFileSync(skillFile, 'utf8')),
		};
	} catch {
		return {installed: true, version: null};
	}
};

const getStatusForSkillsDirectory = ({
	currentVersion,
	scope,
	skillsDirectory,
}: {
	currentVersion: string;
	scope: RemotionSkillsScope;
	skillsDirectory: string;
}): RemotionSkillsStatus => {
	const installedSkills = new Map<
		RemotionSkillName,
		{installed: boolean; version: string | null}
	>();
	for (const skillName of remotionSkillNames) {
		installedSkills.set(
			skillName,
			readRemotionSkill(path.join(skillsDirectory, skillName, 'SKILL.md')),
		);
	}

	if ([...installedSkills.values()].every((skill) => !skill.installed)) {
		return {type: 'not-installed', scope, skillsDirectory};
	}

	const outdatedSkillNames = remotionSkillNames.filter((skillName) => {
		const skill = installedSkills.get(skillName);
		return (
			!skill?.installed ||
			skill.version === null ||
			semver.valid(skill.version) === null ||
			semver.lt(skill.version, currentVersion)
		);
	});

	if (outdatedSkillNames.length > 0) {
		return {type: 'outdated', scope, skillsDirectory, outdatedSkillNames};
	}

	return {type: 'up-to-date', scope, skillsDirectory};
};

export const detectOutdatedRemotionSkills = ({
	currentVersion = VERSION,
	cwd = process.cwd(),
	homeDirectory = homedir(),
}: {
	currentVersion?: string;
	cwd?: string;
	homeDirectory?: string;
} = {}): {
	project: RemotionSkillsStatus;
	global: RemotionSkillsStatus;
} => {
	const projectSkillsDirectory = path.join(cwd, '.agents', 'skills');
	const globalSkillsDirectory = path.join(homeDirectory, '.agents', 'skills');

	return {
		project: getStatusForSkillsDirectory({
			currentVersion,
			scope: 'project',
			skillsDirectory: projectSkillsDirectory,
		}),
		global: getStatusForSkillsDirectory({
			currentVersion,
			scope: 'global',
			skillsDirectory: globalSkillsDirectory,
		}),
	};
};
