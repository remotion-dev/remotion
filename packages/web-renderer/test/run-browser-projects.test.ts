import {expect, test} from 'bun:test';
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

type CommandRecord = {
	command: string[];
	parsed: {project: string[] | null; reporter: unknown};
};

const browsers = ['chromium', 'firefox', 'webkit'];
const runLauncher = async (
	args: string[],
	failure: string | null,
	spawnFailure: string | null,
) => {
	const directory = mkdtempSync(join(tmpdir(), 'remotion-projects-'));
	const journal = join(directory, 'commands.jsonl');
	try {
		const child = Bun.spawn(
			[
				process.execPath,
				'--preload',
				fileURLToPath(
					new URL('./fixtures/browser-project-spawn.ts', import.meta.url),
				),
				fileURLToPath(new URL('./run-browser-projects.ts', import.meta.url)),
				...args,
			],
			{
				cwd: fileURLToPath(new URL('..', import.meta.url)),
				env: {
					...process.env,
					REMOTION_PROJECT_TEST_JOURNAL: journal,
					REMOTION_PROJECT_TEST_FAILURE: failure ?? '',
					REMOTION_PROJECT_TEST_SPAWN_FAILURE: spawnFailure ?? '',
				},
				stdout: 'pipe',
				stderr: 'pipe',
			},
		);
		const [exitCode, , error] = await Promise.all([
			child.exited,
			new Response(child.stdout).text(),
			new Response(child.stderr).text(),
		]);
		const records: CommandRecord[] = existsSync(journal)
			? readFileSync(journal, 'utf8')
					.trim()
					.split('\n')
					.map((row) => JSON.parse(row))
			: [];
		return {
			exitCode,
			commands: records.map((record) => record.command),
			records,
			error,
		};
	} finally {
		rmSync(directory, {recursive: true, force: true});
	}
};

test.each([
	{args: [], expected: browsers},
	{args: ['--project', 'chromium'], expected: ['chromium']},
	{args: ['--project=firefox'], expected: ['firefox']},
	{args: ['-p', 'webkit'], expected: ['webkit']},
	{args: ['-pfirefox'], expected: ['firefox']},
	{args: ['-p=webkit'], expected: ['webkit']},
	{
		args: ['-p', 'chromium', '--project=firefox'],
		expected: ['chromium', 'firefox'],
	},
	{
		args: ['--project', 'chromium', '--project', 'webkit'],
		expected: ['chromium', 'webkit'],
	},
	{args: ['--project=*fox'], expected: ['firefox']},
	{args: ['--project=!webkit'], expected: ['chromium', 'firefox']},
	{args: ['--project=*', '--project=!chrom*'], expected: ['firefox', 'webkit']},
	{args: ['--project=*', '-p', '!web*'], expected: ['chromium', 'firefox']},
	{args: ['--project=FIREFOX'], expected: ['firefox']},
	{args: ['--project=chromium', '--project=!chromium'], expected: []},
	{args: ['--project=unknown'], expected: []},
	{args: ['--', '-p', 'webkit'], expected: browsers},
])('preserves project filtering for $args', async ({args, expected}) => {
	const result = await runLauncher(['--reporter=verbose', ...args], null, null);
	expect(result.exitCode, result.error).toBe(expected.length ? 0 : 1);
	expect(
		result.commands.map((command) => command[command.indexOf('--project') + 1]),
	).toEqual(expected);
	for (const {command, parsed} of result.records) {
		const ownProject = command[command.indexOf('--project') + 1];
		expect(parsed.reporter).toEqual(['verbose']);
		// Interpret the documented filters with a separate glob implementation.
		// This checks effective selection rather than requiring a flag layout.
		const allowed = new Set(browsers);
		const included = new Set<string>();
		let hasPositive = false;
		for (const pattern of parsed.project ?? []) {
			const negative = pattern.startsWith('!');
			if (!negative) hasPositive = true;
			const glob = new Bun.Glob(
				(negative ? pattern.slice(1) : pattern).toLowerCase(),
			);
			for (const browser of browsers) {
				if (!glob.match(browser)) continue;
				if (negative) allowed.delete(browser);
				else included.add(browser);
			}
		}

		expect(
			[...allowed].filter((browser) => !hasPositive || included.has(browser)),
		).toEqual([ownProject]);
	}
});

test.each(browsers)('keeps running after %s fails', async (browser) => {
	const result = await runLauncher([], browser, null);
	expect(result.exitCode).toBe(1);
	expect(result.commands).toHaveLength(3);
});

test('keeps running after a browser cannot spawn', async () => {
	const result = await runLauncher([], null, 'chromium');
	expect(result.exitCode).toBe(1);
	expect(result.commands).toHaveLength(3);
});
