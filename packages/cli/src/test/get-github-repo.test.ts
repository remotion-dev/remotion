import {expect, test} from 'bun:test';
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

test('Should recognize VERCEL', () => {
	process.env.VERCEL_GIT_COMMIT_SHA = '123';
	process.env.VERCEL_GIT_PROVIDER = 'github';
	process.env.VERCEL_GIT_REPO_SLUG = 'remotion';
	process.env.VERCEL_GIT_REPO_OWNER = 'remotion-dev';

	const source = getGitSource({
		remotionRoot: 'dontmatter',
		disableGitSource: false,
		logLevel: 'info',
	});
	expect(source).not.toBeNull();
	expect(source?.name).toBe('remotion');
	expect(source?.org).toBe('remotion-dev');
	expect(source?.ref).toBe('123');
	expect(source?.type).toBe('github');
});
