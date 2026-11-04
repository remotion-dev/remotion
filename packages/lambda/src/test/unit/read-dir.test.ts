import {expect, test} from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {readDirectory} from '../../shared/read-dir';

let canCreateFileSymlinks = true;
const probeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'read-dir-probe-'));
try {
	const target = path.join(probeDir, 'target.txt');
	fs.writeFileSync(target, 'hello');
	fs.symlinkSync(target, path.join(probeDir, 'link.txt'), 'file');
} catch (error) {
	if (
		process.platform !== 'win32' ||
		(error as NodeJS.ErrnoException).code !== 'EPERM'
	) {
		throw error;
	}

	canCreateFileSymlinks = false;
} finally {
	fs.rmSync(probeDir, {recursive: true, force: true});
}

test.skipIf(!canCreateFileSymlinks)(
	'readDirectory hashes file symbolic links',
	async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'read-dir-file-'));
		try {
			const target = path.join(dir, 'target.txt');
			fs.writeFileSync(target, 'hello');
			fs.symlinkSync(target, path.join(dir, 'link.txt'), 'file');
			const etags = readDirectory({
				dir,
				originalDir: dir,
				etags: {},
				onProgress: () => {},
			});
			expect(await etags['link.txt']()).toBe(
				'"5d41402abc4b2a76b9719d911017c592"',
			);
		} finally {
			fs.rmSync(dir, {recursive: true, force: true});
		}
	},
);

test('readDirectory rejects directory symbolic links', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'read-dir-directory-'));
	try {
		const target = path.join(dir, 'target');
		fs.mkdirSync(target);
		const nested = path.join(dir, 'nested');
		fs.mkdirSync(nested);
		fs.symlinkSync(
			target,
			path.join(nested, 'link'),
			process.platform === 'win32' ? 'junction' : 'dir',
		);
		expect(() =>
			readDirectory({
				dir,
				originalDir: dir,
				etags: {},
				onProgress: () => {},
			}),
		).toThrow(
			`The directory ${dir} contains a symbolic link to a directory at nested/link. Directory symbolic links are not supported when deploying a site.`,
		);
	} finally {
		fs.rmSync(dir, {recursive: true, force: true});
	}
});
