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
	console.log(gitConfig);
	expect(getGitRemoteOrigin(gitConfig as string)).toEqual({
		remote: 'origin',
		url: 'https://github.com/remotion-dev/remotion.git',
	});
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

test('Should get Gif Ref', () => {
	expect(typeof getGifRef() === 'string').toBe(true);
});

test('Should get Git Source', () => {
	const git = getGitSource(process.cwd());
	expect(git).not.toBeNull();
	expect(git?.relativeFromGitRoot).toBe('packages/cli');
});
