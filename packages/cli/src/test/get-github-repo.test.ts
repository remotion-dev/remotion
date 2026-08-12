import {expect, test} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	getGifRef,
	getGitConfig,
	getGitRemoteOrigin,
	getGitSource,
	normalizeGitRemoteUrl,
} from '../get-github-repository';

test('Get GitHub repo', () => {
	const gitConfig = getGitConfig(__dirname);
	const origin = getGitRemoteOrigin(gitConfig as string);
	expect(origin?.remote).toEqual('origin');
	expect(
		origin?.url === 'https://github.com/remotion-dev/remotion.git' ||
			origin?.url === 'https://github.com/remotion-dev/remotion',
	).toEqual(true);
});

test('Should normalize SSH URLs', () => {
	expect(
		normalizeGitRemoteUrl('git@github.com:JonnyBurger/website-scroller.git'),
	).toEqual({
		type: 'github',
		org: 'JonnyBurger',
		name: 'website-scroller',
	});
});

test('Should normalize HTTPS URLs', () => {
	expect(
		normalizeGitRemoteUrl('https://github.com/remotion-dev/remotion.git'),
	).toEqual({
		type: 'github',
		org: 'remotion-dev',
		name: 'remotion',
	});
});

test('Should normalize HTTPS URLs without .git', () => {
	expect(
		normalizeGitRemoteUrl('https://github.com/remotion-dev/remotion'),
	).toEqual({
		type: 'github',
		org: 'remotion-dev',
		name: 'remotion',
	});
});

test('Should get Gif Ref', () => {
	expect(typeof getGifRef('info') === 'string').toBe(true);
});

test('Should get Git Source', () => {
	const git = getGitSource({
		remotionRoot: process.cwd(),
		disableGitSource: false,
		logLevel: 'info',
	});
	expect(git).not.toBeNull();
	expect(git?.relativeFromGitRoot).toBe(`packages${path.sep}cli`);
});

test('Should get Git Source from a linked worktree', () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-git-source-'),
	);
	const mainCheckout = path.join(temporaryDirectory, 'main');
	const linkedWorktree = path.join(temporaryDirectory, 'linked');

	try {
		mkdirSync(mainCheckout);
		execFileSync('git', ['-C', mainCheckout, 'init'], {stdio: 'ignore'});
		writeFileSync(path.join(mainCheckout, 'README.md'), 'Remotion');
		execFileSync('git', ['-C', mainCheckout, 'add', 'README.md'], {
			stdio: 'ignore',
		});
		execFileSync(
			'git',
			[
				'-C',
				mainCheckout,
				'-c',
				'user.name=Remotion Test',
				'-c',
				'user.email=test@remotion.dev',
				'commit',
				'-m',
				'Initial commit',
			],
			{stdio: 'ignore'},
		);
		execFileSync(
			'git',
			[
				'-C',
				mainCheckout,
				'remote',
				'add',
				'origin',
				'https://github.com/remotion-dev/remotion.git',
			],
			{stdio: 'ignore'},
		);
		execFileSync(
			'git',
			['-C', mainCheckout, 'worktree', 'add', '--detach', linkedWorktree],
			{stdio: 'ignore'},
		);
		const remotionRoot = path.join(linkedWorktree, 'packages', 'example');
		mkdirSync(remotionRoot, {recursive: true});
		const commit = execFileSync('git', [
			'-C',
			linkedWorktree,
			'rev-parse',
			'HEAD',
		])
			.toString('utf-8')
			.trim();

		expect(
			getGitSource({
				remotionRoot,
				disableGitSource: false,
				logLevel: 'info',
			}),
		).toEqual({
			name: 'remotion',
			org: 'remotion-dev',
			ref: commit,
			relativeFromGitRoot: path.join('packages', 'example'),
			type: 'github',
		});
	} finally {
		rmSync(temporaryDirectory, {force: true, recursive: true});
	}
});

test('Should recognize VERCEL', () => {
	process.env.VERCEL_GIT_COMMIT_SHA = '123';
	process.env.VERCEL_GIT_PROVIDER = 'github';
	process.env.VERCEL_GIT_REPO_SLUG = 'remotion';
	process.env.VERCEL_GIT_REPO_OWNER = 'remotion-dev';

	const source = getGitSource({
		remotionRoot: process.cwd(),
		disableGitSource: false,
		logLevel: 'info',
	});
	expect(source).not.toBeNull();
	expect(source?.name).toBe('remotion');
	expect(source?.org).toBe('remotion-dev');
	expect(source?.ref).toBe('123');
	expect(source?.type).toBe('github');
	expect(source?.relativeFromGitRoot).toBe(`packages${path.sep}cli`);

	delete process.env.VERCEL_GIT_COMMIT_SHA;
	delete process.env.VERCEL_GIT_PROVIDER;
	delete process.env.VERCEL_GIT_REPO_SLUG;
	delete process.env.VERCEL_GIT_REPO_OWNER;
});
