import {expect, test} from 'bun:test';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	getRemotionSkillsInfo,
	remotionSkillsInfoHandler,
} from '../preview-server/routes/remotion-skills-info';

const writeSkill = (skillsDirectory: string, skillName: string) => {
	const skillDirectory = path.join(skillsDirectory, skillName);
	mkdirSync(skillDirectory, {recursive: true});
	writeFileSync(path.join(skillDirectory, 'SKILL.md'), '---\n---\n');
};

test('the skills info endpoint reports project skills', async () => {
	const remotionRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-skills-info-route-'),
	);

	try {
		writeSkill(
			path.join(remotionRoot, '.agents', 'skills'),
			'remotion-interactivity',
		);
		const response = await remotionSkillsInfoHandler({
			binariesDirectory: null,
			configFile: null,
			entryPoint: '',
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			input: {},
			logLevel: 'error',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot,
			request: {} as never,
			response: {} as never,
		});

		expect(response.remotionUpgradeSkillAvailable).toBe(false);
		expect(response.remotionInteractivitySkillAvailable).toBe(true);
		expect(response.skills.map(({name}) => name)).toEqual([
			'remotion-best-practices',
			'remotion-captions',
			'remotion-create',
			'remotion-docs',
			'remotion-interactivity',
			'remotion-maps',
			'remotion-markup',
			'remotion-multimedia',
			'remotion-render',
			'remotion-saas',
			'remotion-studio',
			'remotion-upgrade',
		]);
		expect(
			response.skills.filter(({installedInProject}) => installedInProject),
		).toEqual([
			{
				name: 'remotion-interactivity',
				installedGlobally: false,
				installedInProject: true,
			},
		]);
	} finally {
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('global skills are also available to the endpoint response', () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-global-skills-info-'),
	);
	const remotionRoot = path.join(temporaryDirectory, 'project');
	const homeDirectory = path.join(temporaryDirectory, 'home');

	try {
		writeSkill(
			path.join(homeDirectory, '.agents', 'skills'),
			'remotion-upgrade',
		);
		writeSkill(
			path.join(homeDirectory, '.agents', 'skills'),
			'remotion-interactivity',
		);

		const response = getRemotionSkillsInfo({remotionRoot, homeDirectory});
		expect(response.remotionUpgradeSkillAvailable).toBe(true);
		expect(response.remotionInteractivitySkillAvailable).toBe(true);
		expect(
			response.skills.filter(({installedGlobally}) => installedGlobally),
		).toEqual([
			{
				name: 'remotion-interactivity',
				installedGlobally: true,
				installedInProject: false,
			},
			{
				name: 'remotion-upgrade',
				installedGlobally: true,
				installedInProject: false,
			},
		]);
	} finally {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	}
});
