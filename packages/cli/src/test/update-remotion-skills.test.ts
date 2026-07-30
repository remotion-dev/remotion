import {expect, test} from 'bun:test';
import {
	chmodSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {remotionSkillNames} from '../remotion-skill-names';
import {updateRemotionSkills} from '../update-remotion-skills';

const writeRecognizedSkill = (skillsDirectory: string) => {
	const skillName = remotionSkillNames[0];
	const skillDirectory = path.join(skillsDirectory, skillName);
	mkdirSync(skillDirectory, {recursive: true});
	writeFileSync(
		path.join(skillDirectory, 'SKILL.md'),
		`---\nname: ${skillName}\ndescription: Test skill\nversion: 4.0.501\n---\n`,
	);
};

test('updates only recognized project-local Remotion skills unless skipped', async () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-upgrade-skills-'),
	);
	const projectDirectory = path.join(temporaryDirectory, 'project');
	const homeDirectory = path.join(temporaryDirectory, 'home');
	const fakeNpxDirectory = path.join(temporaryDirectory, 'bin');
	const outputFile = path.join(temporaryDirectory, 'calls.jsonl');
	const fakeNpxPath = path.join(
		fakeNpxDirectory,
		process.platform === 'win32' ? 'npx.cmd' : 'npx',
	);
	const fakeNpxScript = `import {appendFileSync} from 'node:fs';
appendFileSync(process.env.REMOTION_SKILLS_TEST_OUTPUT, JSON.stringify({args: process.argv.slice(2), cwd: process.cwd()}) + '\\n');
`;

	try {
		mkdirSync(projectDirectory, {recursive: true});
		mkdirSync(fakeNpxDirectory, {recursive: true});
		writeRecognizedSkill(path.join(projectDirectory, '.agents', 'skills'));
		writeRecognizedSkill(path.join(homeDirectory, '.agents', 'skills'));

		if (process.platform === 'win32') {
			const fakeNpxScriptPath = path.join(temporaryDirectory, 'fake-npx.mjs');
			writeFileSync(fakeNpxScriptPath, fakeNpxScript);
			writeFileSync(
				fakeNpxPath,
				`@"${process.execPath}" "${fakeNpxScriptPath}" %*\r\n`,
			);
		} else {
			writeFileSync(fakeNpxPath, `#!${process.execPath}\n${fakeNpxScript}`);
			chmodSync(fakeNpxPath, 0o755);
		}

		const environment = {
			...process.env,
			HOME: homeDirectory,
			PATH: `${fakeNpxDirectory}${path.delimiter}${process.env.PATH}`,
			REMOTION_SKILLS_TEST_OUTPUT: outputFile,
		};

		await updateRemotionSkills({
			currentVersion: '4.0.502',
			cwd: projectDirectory,
			homeDirectory,
			skipSkills: true,
			logLevel: 'error',
			environment,
		});
		expect(existsSync(outputFile)).toBe(false);

		await updateRemotionSkills({
			currentVersion: '4.0.502',
			cwd: projectDirectory,
			homeDirectory,
			skipSkills: false,
			logLevel: 'error',
			environment,
		});

		const calls = readFileSync(outputFile, 'utf8')
			.trim()
			.split('\n')
			.map((line) => JSON.parse(line));
		const canonicalProjectDirectory = realpathSync(projectDirectory);
		expect(calls).toEqual([
			{
				args: [
					'--loglevel=error',
					'skills',
					'update',
					...remotionSkillNames,
					'--project',
					'--yes',
				],
				cwd: canonicalProjectDirectory,
			},
		]);

		await updateRemotionSkills({
			currentVersion: '4.0.502',
			cwd: path.join(temporaryDirectory, 'unrecognized-project'),
			homeDirectory: path.join(temporaryDirectory, 'unrecognized-home'),
			skipSkills: false,
			logLevel: 'error',
			environment,
		});
		expect(readFileSync(outputFile, 'utf8').trim().split('\n')).toHaveLength(1);
	} finally {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	}
});
