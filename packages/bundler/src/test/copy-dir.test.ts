import {afterEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {copyDir} from '../copy-dir';

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(
		tempDirs.splice(0).map((dir) => fs.promises.rm(dir, {recursive: true, force: true})),
	);
});

test('copies a directory link in public without copying its contents', async () => {
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-copy-dir-'));
	tempDirs.push(root);
	const src = path.join(root, 'public');
	const target = path.join(root, 'media');
	const dest = path.join(root, 'out', 'public');
	await fs.promises.mkdir(src);
	await fs.promises.mkdir(target);
	await fs.promises.writeFile(path.join(target, 'image.txt'), 'image');
	await fs.promises.symlink(
		target,
		path.join(src, 'media'),
		process.platform === 'win32' ? 'junction' : 'dir',
	);

	let detected = 0;
	const copiedBytes = await copyDir({
		src,
		dest,
		onSymlinkDetected: () => detected++,
		onProgress: () => {},
		copiedBytes: 0,
		lastReportedProgress: 0,
	});

	expect(detected).toBe(1);
	expect(copiedBytes).toBe(0);
	expect((await fs.promises.lstat(path.join(dest, 'media'))).isSymbolicLink()).toBe(true);
	expect(await fs.promises.readFile(path.join(dest, 'media', 'image.txt'), 'utf8')).toBe('image');
});
