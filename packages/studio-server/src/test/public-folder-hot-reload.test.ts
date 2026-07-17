import {afterEach, expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	getFiles,
	initPublicFolderWatch,
	resetPublicFolderWatchForTests,
	syncPublicFolderWatch,
} from '../preview-server/public-folder';

const makePublicDir = (name: string) => {
	return mkdtempSync(path.join(tmpdir(), `remotion-public-${name}-`));
};

afterEach(() => {
	resetPublicFolderWatchForTests();
});

test('public folder watch switches when getPublicDir resolves a new directory', () => {
	const firstPublicDir = makePublicDir('first');
	const secondPublicDir = makePublicDir('second');
	writeFileSync(path.join(firstPublicDir, 'first.txt'), 'first');
	writeFileSync(path.join(secondPublicDir, 'second.txt'), 'second');

	let currentPublicDir = firstPublicDir;
	let updateCount = 0;

	try {
		initPublicFolderWatch({
			getPublicDir: () => currentPublicDir,
			remotionRoot: path.dirname(firstPublicDir),
			onUpdate: () => {
				updateCount += 1;
			},
			staticHash: '/static-test',
		});

		expect(getFiles().map((file) => file.name)).toEqual(['first.txt']);
		expect(updateCount).toBe(0);

		currentPublicDir = secondPublicDir;
		syncPublicFolderWatch();

		expect(getFiles().map((file) => file.name)).toEqual(['second.txt']);
		expect(updateCount).toBe(1);

		syncPublicFolderWatch();
		expect(updateCount).toBe(1);
	} finally {
		rmSync(firstPublicDir, {force: true, recursive: true});
		rmSync(secondPublicDir, {force: true, recursive: true});
	}
});
