import {expect, test} from 'bun:test';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {isUpdateAvailable} from '../preview-server/update-available';

test('reports outdated project skills when Remotion itself is up to date', async () => {
	const remotionRoot = mkdtempSync(
		path.join(tmpdir(), 'remotion-studio-skills-update-'),
	);
	const skillDirectory = path.join(
		remotionRoot,
		'.agents',
		'skills',
		'remotion-best-practices',
	);

	try {
		mkdirSync(skillDirectory, {recursive: true});
		writeFileSync(
			path.join(skillDirectory, 'SKILL.md'),
			'---\nname: remotion-best-practices\nversion: 4.0.501\n---\n',
		);

		const result = await isUpdateAvailable({
			remotionRoot,
			currentVersion: '4.0.502',
			logLevel: 'error',
			getLatestVersion: () => Promise.resolve('4.0.502'),
		});

		expect(result).toMatchObject({
			currentVersion: '4.0.502',
			latestVersion: '4.0.502',
			updateAvailable: false,
			skillsUpdateAvailable: true,
			remotionUpgradeSkillAvailable: false,
			timedOut: false,
		});

		const upgradeSkillDirectory = path.join(
			remotionRoot,
			'.agents',
			'skills',
			'remotion-upgrade',
		);
		mkdirSync(upgradeSkillDirectory, {recursive: true});
		writeFileSync(
			path.join(upgradeSkillDirectory, 'SKILL.md'),
			'---\nname: remotion-upgrade\nversion: 4.0.501\n---\n',
		);

		const resultWithUpgradeSkill = await isUpdateAvailable({
			remotionRoot,
			currentVersion: '4.0.502',
			logLevel: 'error',
			getLatestVersion: () => Promise.resolve('4.0.502'),
		});

		expect(resultWithUpgradeSkill).toMatchObject({
			skillsUpdateAvailable: true,
			remotionUpgradeSkillAvailable: true,
		});
	} finally {
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
