import {expect, test} from 'vitest';
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
	expect(typeof getGifRef() === 'string').toBe(true);
});

test('Should get Git Source', () => {
	const git = getGitSource(process.cwd());
	expect(git).not.toBeNull();
	expect(git?.relativeFromGitRoot).toBe('packages/cli');
});
