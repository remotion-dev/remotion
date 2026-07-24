import {afterEach, expect, test} from 'bun:test';
import {mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {resolveBundleDirectory} from '../../cli/commands/sites/resolve-bundle-directory';

const temporaryDirectories: string[] = [];

const makeTemporaryDirectory = () => {
	const directory = mkdtempSync(
		path.join(os.tmpdir(), 'remotion-resolve-bundle-directory-'),
	);
	temporaryDirectories.push(directory);
	return directory;
};

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, {recursive: true, force: true});
	}
});

test('defaults to the build directory in the Remotion root', () => {
	const remotionRoot = makeTemporaryDirectory();
	const currentWorkingDirectory = makeTemporaryDirectory();

	expect(
		resolveBundleDirectory({
			bundleDir: undefined,
			remotionRoot,
			currentWorkingDirectory,
		}),
	).toBe(path.join(remotionRoot, 'build'));
});

test('resolves explicit bundle directories from cwd first', () => {
	const remotionRoot = makeTemporaryDirectory();
	const currentWorkingDirectory = makeTemporaryDirectory();
	mkdirSync(path.join(currentWorkingDirectory, 'artifact'));
	mkdirSync(path.join(remotionRoot, 'artifact'));

	expect(
		resolveBundleDirectory({
			bundleDir: 'artifact',
			remotionRoot,
			currentWorkingDirectory,
		}),
	).toBe(path.join(currentWorkingDirectory, 'artifact'));
});

test('falls back to resolving explicit bundle directories from the Remotion root', () => {
	const remotionRoot = makeTemporaryDirectory();
	const currentWorkingDirectory = makeTemporaryDirectory();

	expect(
		resolveBundleDirectory({
			bundleDir: 'artifact',
			remotionRoot,
			currentWorkingDirectory,
		}),
	).toBe(path.join(remotionRoot, 'artifact'));
});
