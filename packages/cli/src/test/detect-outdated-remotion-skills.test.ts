import {expect, test} from 'bun:test';
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {
	detectOutdatedRemotionSkills,
	parseRemotionSkillVersion,
} from '../detect-outdated-remotion-skills';
import {remotionSkillNames} from '../remotion-skill-names';
import type {RemotionSkillName} from '../remotion-skill-names';

const writeSkill = ({
	skillsDirectory,
	skillName,
	version,
}: {
	skillsDirectory: string;
	skillName: RemotionSkillName;
	version: string | null;
}) => {
	const skillDirectory = path.join(skillsDirectory, skillName);
	mkdirSync(skillDirectory, {recursive: true});
	writeFileSync(
		path.join(skillDirectory, 'SKILL.md'),
		`---\nname: ${skillName}\ndescription: Test skill\n${version === null ? '' : `version: ${version}\n`}---\n`,
	);
};

test('detects project and global Remotion skill versions without a lockfile', () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-skills-status-'),
	);
	const projectDirectory = path.join(temporaryDirectory, 'project');
	const homeDirectory = path.join(temporaryDirectory, 'home');
	const projectSkillsDirectory = path.join(
		projectDirectory,
		'.agents',
		'skills',
	);
	const globalSkillsDirectory = path.join(homeDirectory, '.agents', 'skills');

	try {
		mkdirSync(projectDirectory, {recursive: true});
		writeFileSync(
			path.join(projectDirectory, 'skills-lock.json'),
			JSON.stringify({
				version: 1,
				skills: Object.fromEntries(
					remotionSkillNames.map((skillName) => [
						skillName,
						{computedHash: 'ignored'},
					]),
				),
			}),
		);

		expect(
			detectOutdatedRemotionSkills({
				currentVersion: '4.0.502',
				cwd: projectDirectory,
				homeDirectory,
			}),
		).toEqual({
			project: {
				type: 'not-installed',
				scope: 'project',
				skillsDirectory: projectSkillsDirectory,
			},
			global: {
				type: 'not-installed',
				scope: 'global',
				skillsDirectory: globalSkillsDirectory,
			},
		});

		const firstSkill = remotionSkillNames[0];
		writeSkill({
			skillsDirectory: projectSkillsDirectory,
			skillName: firstSkill,
			version: '4.0.502',
		});
		expect(
			detectOutdatedRemotionSkills({
				currentVersion: '4.0.502',
				cwd: projectDirectory,
				homeDirectory,
			}).project,
		).toEqual({
			type: 'outdated',
			scope: 'project',
			skillsDirectory: projectSkillsDirectory,
			outdatedSkillNames: remotionSkillNames.slice(1),
		});

		for (const skillName of remotionSkillNames) {
			writeSkill({
				skillsDirectory: projectSkillsDirectory,
				skillName,
				version: '4.0.502',
			});
			writeSkill({
				skillsDirectory: globalSkillsDirectory,
				skillName,
				version: '4.0.503',
			});
		}

		const currentStatuses = detectOutdatedRemotionSkills({
			currentVersion: '4.0.502',
			cwd: projectDirectory,
			homeDirectory,
		});
		expect(currentStatuses.project.type).toBe('up-to-date');
		expect(currentStatuses.global.type).toBe('up-to-date');

		const lastSkill = remotionSkillNames.at(-1) as RemotionSkillName;
		writeSkill({
			skillsDirectory: projectSkillsDirectory,
			skillName: firstSkill,
			version: null,
		});
		writeSkill({
			skillsDirectory: projectSkillsDirectory,
			skillName: lastSkill,
			version: '4.0.501',
		});
		expect(
			detectOutdatedRemotionSkills({
				currentVersion: '4.0.502',
				cwd: projectDirectory,
				homeDirectory,
			}).project,
		).toEqual({
			type: 'outdated',
			scope: 'project',
			skillsDirectory: projectSkillsDirectory,
			outdatedSkillNames: [firstSkill, lastSkill],
		});
	} finally {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	}
});

test('all source Remotion skills match the current Remotion version', () => {
	const skillsDirectory = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'skills',
		'skills',
	);
	const sourceSkillNames = readdirSync(skillsDirectory, {withFileTypes: true})
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
	expect(sourceSkillNames).toEqual([...remotionSkillNames].sort());

	for (const skillName of remotionSkillNames) {
		const contents = readFileSync(
			path.join(skillsDirectory, skillName, 'SKILL.md'),
			'utf8',
		);
		expect(parseRemotionSkillVersion(contents)).toBe(VERSION);
	}
});
