import {describe, expect, test} from 'bun:test';
import path from 'node:path';
import {validatePublicDir} from '../validate-public-dir';

describe('validatePublicDir()', () => {
	test('Should not allow root directory as public dir.', () => {
		expect(() => validatePublicDir(path.parse(process.cwd()).root)).toThrow(
			/which is the root directory. This is not allowed./,
		);
	});

	test('Should not allow a path where the parent directory does not exist', () => {
		const pathToPass =
			process.platform === 'win32' ? 'C:\\foo\\bar' : '/foo/bar';
		const expectedParent = process.platform === 'win32' ? 'C:\\foo' : '/foo';

		expect(() => validatePublicDir(pathToPass)).toThrow(
			`The public directory was specified as "${pathToPass}", but this folder does not exist and the parent directory "${expectedParent}" does also not exist.`,
		);
	});

	test('Should allow /foo as a path since that directory can be created', () => {
		expect(() =>
			validatePublicDir(process.platform === 'win32' ? 'C:\\foo' : '/foo'),
		).not.toThrow();
	});
});
