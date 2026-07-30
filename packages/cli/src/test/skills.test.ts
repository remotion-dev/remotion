import {expect, test} from 'bun:test';
import {spawn} from 'node:child_process';
import {
	chmodSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const runSkillsCommand = ({
	args,
	fakeNpxDirectory,
	outputFile,
}: {
	args: string[];
	fakeNpxDirectory: string;
	outputFile: string;
}) => {
	return new Promise<void>((resolve, reject) => {
		const cliPath = path.join(__dirname, '..', '..', 'remotion-cli.js');
		const child = spawn(process.execPath, [cliPath, 'skills', ...args], {
			env: {
				...process.env,
				PATH: `${fakeNpxDirectory}${path.delimiter}${process.env.PATH}`,
				REMOTION_SKILLS_TEST_OUTPUT: outputFile,
			},
			stdio: 'inherit',
		});

		child.on('error', reject);
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Remotion CLI exited with code ${code}`));
			}
		});
	});
};

test('forwards the correct arguments to the skills CLI', async () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-skills-cli-'),
	);
	const fakeNpxPath = path.join(
		temporaryDirectory,
		process.platform === 'win32' ? 'npx.cmd' : 'npx',
	);
	const outputFile = path.join(temporaryDirectory, 'arguments.jsonl');
	const fakeNpxScript = `import {appendFileSync} from 'node:fs';
appendFileSync(process.env.REMOTION_SKILLS_TEST_OUTPUT, JSON.stringify(process.argv.slice(2)) + '\\n');
`;

	try {
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

		await runSkillsCommand({
			args: ['add'],
			fakeNpxDirectory: temporaryDirectory,
			outputFile,
		});
		await runSkillsCommand({
			args: ['update'],
			fakeNpxDirectory: temporaryDirectory,
			outputFile,
		});

		const [addArguments, updateArguments] = readFileSync(outputFile, 'utf8')
			.trim()
			.split('\n')
			.map((line) => JSON.parse(line));
		const skillsDirectory = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'skills',
			'skills',
		);
		const remotionSkillNames = readdirSync(skillsDirectory, {
			withFileTypes: true,
		})
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
			.sort();

		expect(addArguments).toEqual([
			'--loglevel=error',
			'skills@1.5.20',
			'add',
			'remotion-dev/skills',
			'--yes',
		]);
		expect(updateArguments).toEqual([
			'--loglevel=error',
			'skills',
			'update',
			...remotionSkillNames,
			'--yes',
		]);
	} finally {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	}
});
