import {expect, test} from 'bun:test';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {getFiles, initPublicFolderWatch} from '../preview-server/public-folder';

test('switches the public folder and refreshes the file list', () => {
	const temporaryDirectory = mkdtempSync(
		path.join(tmpdir(), 'remotion-public-folder-'),
	);
	const firstPublicDir = path.join(temporaryDirectory, 'first');
	const secondPublicDir = path.join(temporaryDirectory, 'second');
	mkdirSync(firstPublicDir);
	mkdirSync(secondPublicDir);
	writeFileSync(path.join(firstPublicDir, 'first.txt'), 'first');
	writeFileSync(path.join(secondPublicDir, 'second.txt'), 'second');

	let updates = 0;
	const publicFolderWatch = initPublicFolderWatch({
		publicDir: firstPublicDir,
		remotionRoot: temporaryDirectory,
		staticHash: '/static-test',
		onUpdate: () => {
			updates++;
		},
	});

	try {
		expect(getFiles().map((file) => file.name)).toEqual(['first.txt']);

		publicFolderWatch.updatePublicFolderWatch(secondPublicDir);
		expect(getFiles().map((file) => file.name)).toEqual(['second.txt']);
		expect(updates).toBe(1);
	} finally {
		publicFolderWatch.close();
		rmSync(temporaryDirectory, {recursive: true});
	}
});
