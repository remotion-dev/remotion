import {expect, test} from 'bun:test';
import {spawn} from 'node:child_process';
import {
	chmodSync,
	mkdtempSync,
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
	const fakeNpxPath = path.join(temporaryDirectory, 'npx');
	const outputFile = path.join(temporaryDirectory, 'arguments.jsonl');

	try {
		writeFileSync(
			fakeNpxPath,
			`#!${process.execPath}
import {appendFileSync} from 'node:fs';
appendFileSync(process.env.REMOTION_SKILLS_TEST_OUTPUT, JSON.stringify(process.argv.slice(2)) + '\\n');
`,
		);
		chmodSync(fakeNpxPath, 0o755);

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
			'remotion-upgrade',
			'--yes',
		]);
	} finally {
		rmSync(temporaryDirectory, {recursive: true, force: true});
	}
});
