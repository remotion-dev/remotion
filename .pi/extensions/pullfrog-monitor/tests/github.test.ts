import {afterEach, describe, expect, test} from 'bun:test';
import {execFile} from 'node:child_process';
import {access, chmod, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {getCurrentPullRequest} from '../github';

const execFileAsync = promisify(execFile);
const directories: string[] = [];
const originalPath = process.env.PATH;
const originalArgsFile = process.env.GH_ARGS_FILE;
const originalNoPr = process.env.GH_NO_PR;

afterEach(async () => {
	process.env.PATH = originalPath;
	if (originalArgsFile === undefined) {
		delete process.env.GH_ARGS_FILE;
	} else {
		process.env.GH_ARGS_FILE = originalArgsFile;
	}
	if (originalNoPr === undefined) {
		delete process.env.GH_NO_PR;
	} else {
		process.env.GH_NO_PR = originalNoPr;
	}
	await Promise.all(
		directories
			.splice(0)
			.map((directory) => rm(directory, {recursive: true, force: true})),
	);
});

describe('current pull request resolution', () => {
	test('uses only the current branch and returns null without one', async () => {
		const directory = await mkdtemp(join(tmpdir(), 'pullfrog-github-test-'));
		directories.push(directory);
		const bin = join(directory, 'bin');
		const repository = join(directory, 'repository');
		const argsFile = join(directory, 'gh-args');
		await Promise.all([
			mkdir(bin, {recursive: true}),
			mkdir(repository, {recursive: true}),
		]);
		await execFileAsync('git', ['init', '-b', 'feature', repository]);
		await execFileAsync(
			'git',
			['-C', repository, 'commit', '--allow-empty', '-m', 'initial'],
			{
				env: {
					...process.env,
					GIT_AUTHOR_NAME: 'Test',
					GIT_AUTHOR_EMAIL: 'test@example.com',
					GIT_COMMITTER_NAME: 'Test',
					GIT_COMMITTER_EMAIL: 'test@example.com',
				},
			},
		);
		const gh = join(bin, 'gh');
		await writeFile(
			gh,
			'#!/bin/sh\nprintf "%s\\n" "$*" > "$GH_ARGS_FILE"\nif [ "$GH_NO_PR" = "1" ]; then echo "no pull requests found for branch feature" >&2; exit 1; fi\necho \'{"number":123,"state":"OPEN"}\'\n',
			'utf8',
		);
		await chmod(gh, 0o755);
		process.env.PATH = `${bin}:${originalPath ?? ''}`;
		process.env.GH_ARGS_FILE = argsFile;

		expect(
			await getCurrentPullRequest({
				repository: 'owner/repo',
				cwd: repository,
			}),
		).toEqual({number: 123, state: 'OPEN'});
		expect(await Bun.file(argsFile).text()).toBe(
			'pr view feature --repo owner/repo --json number,state\n',
		);

		process.env.GH_NO_PR = '1';
		expect(
			await getCurrentPullRequest({
				repository: 'owner/repo',
				cwd: repository,
			}),
		).toBeNull();

		delete process.env.GH_NO_PR;
		await execFileAsync('git', ['-C', repository, 'checkout', '--detach']);
		await rm(argsFile, {force: true});
		expect(
			await getCurrentPullRequest({
				repository: 'owner/repo',
				cwd: repository,
			}),
		).toBeNull();
		await expect(access(argsFile)).rejects.toThrow();
	});
});
