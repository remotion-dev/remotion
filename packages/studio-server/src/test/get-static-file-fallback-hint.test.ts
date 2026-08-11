import {expect, test} from 'bun:test';
import {mkdirSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {getStaticFileFallbackHint} from '../preview-server/get-static-file-fallback-hint';

const makeTempPublicDir = () => {
	const dir = path.join(
		os.tmpdir(),
		`studio-server-public-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	mkdirSync(dir, {recursive: true});
	return dir;
};

test('returns relative file path when file exists in public dir', () => {
	const publicDir = makeTempPublicDir();
	writeFileSync(path.join(publicDir, 'video.mp4'), 'test');

	const hint = getStaticFileFallbackHint({
		method: 'GET',
		pathname: '/video.mp4',
		publicDir,
	});

	expect(hint).toBe('video.mp4');
});

test('returns null for paths without extension', () => {
	const publicDir = makeTempPublicDir();
	writeFileSync(path.join(publicDir, 'video.mp4'), 'test');

	const hint = getStaticFileFallbackHint({
		method: 'GET',
		pathname: '/about',
		publicDir,
	});

	expect(hint).toBeNull();
});

test('returns null for non-GET and non-HEAD methods', () => {
	const publicDir = makeTempPublicDir();
	writeFileSync(path.join(publicDir, 'video.mp4'), 'test');

	const hint = getStaticFileFallbackHint({
		method: 'POST',
		pathname: '/video.mp4',
		publicDir,
	});

	expect(hint).toBeNull();
});

test('returns null for non-existing file', () => {
	const publicDir = makeTempPublicDir();

	const hint = getStaticFileFallbackHint({
		method: 'GET',
		pathname: '/missing.mp4',
		publicDir,
	});

	expect(hint).toBeNull();
});

test('returns null for path traversal attempts', () => {
	const publicDir = makeTempPublicDir();
	writeFileSync(path.join(publicDir, 'safe.mp4'), 'test');

	const hint = getStaticFileFallbackHint({
		method: 'GET',
		pathname: '/../safe.mp4',
		publicDir,
	});

	expect(hint).toBeNull();
});
