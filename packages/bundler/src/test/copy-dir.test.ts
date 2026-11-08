import {afterEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {copyDir} from '../copy-dir';

const tempDirs: string[] = [];

afterEach(async () => {
	for (const dir of tempDirs.splice(0)) {
		await fs.promises.rm(dir, {recursive: true, force: true});
	}
});

test('copies a directory link in public without copying its contents', async () => {
	const tempRoot = path.join(os.tmpdir(), 'remotion-copy-dir-');
	const root = await fs.promises.mkdtemp(tempRoot);
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
	const destLink = path.join(dest, 'media');
	const linkStat = await fs.promises.lstat(destLink);
	expect(linkStat.isSymbolicLink()).toBe(true);
	const asset = await fs.promises.readFile(
		path.join(destLink, 'image.txt'),
		'utf8',
	);
	expect(asset).toBe('image');
});
