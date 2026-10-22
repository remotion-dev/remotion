import {expect, test} from 'bun:test';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {isUpdateAvailable} from '../preview-server/update-available';

test('only reports installed outdated project skills', async () => {
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
			'---\nname: remotion-best-practices\nversion: 4.0.502\n---\n',
		);

		const currentResult = await isUpdateAvailable({
			remotionRoot,
			currentVersion: '4.0.502',
			logLevel: 'error',
			getLatestVersion: () => Promise.resolve('4.0.502'),
		});

		expect(currentResult).toMatchObject({
			currentVersion: '4.0.502',
			latestVersion: '4.0.502',
			updateAvailable: false,
			skillsUpdateAvailable: false,
			timedOut: false,
		});

		writeFileSync(
			path.join(skillDirectory, 'SKILL.md'),
			'---\nname: remotion-best-practices\nversion: 4.0.501\n---\n',
		);

		const outdatedResult = await isUpdateAvailable({
			remotionRoot,
			currentVersion: '4.0.502',
			logLevel: 'error',
			getLatestVersion: () => Promise.resolve('4.0.502'),
		});

		expect(outdatedResult).toMatchObject({
			currentVersion: '4.0.502',
			latestVersion: '4.0.502',
			updateAvailable: false,
			skillsUpdateAvailable: true,
			timedOut: false,
		});
	} finally {
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
