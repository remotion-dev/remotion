import {afterEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {getInstalledInstallablePackages} from '../helpers/get-installed-installable-packages';

const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		fs.rmSync(directory, {force: true, recursive: true});
	}
});

test('returns all dependencies declared by the project', () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-deps-'));
	temporaryDirectories.push(directory);
	fs.writeFileSync(
		path.join(directory, 'package.json'),
		JSON.stringify({
			dependencies: {react: '19.0.0'},
			devDependencies: {lodash: '4.17.21'},
			optionalDependencies: {'@acme/optional': '1.0.0'},
			peerDependencies: {zod: '3.0.0'},
		}),
	);

	expect(getInstalledInstallablePackages(directory)).toEqual([
		'react',
		'lodash',
		'@acme/optional',
		'zod',
	]);
});
