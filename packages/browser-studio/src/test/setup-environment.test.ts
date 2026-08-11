import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getBrowserStudioSetupEnvironmentForBuild} from '../dev/get-setup-environment-for-build';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoDir = join(packageDir, '..', '..');

test('browser studio setup environment is derived from bundler', () => {
	expect(getBrowserStudioSetupEnvironmentForBuild()).toBe(
		readFileSync(
			join(repoDir, 'packages', 'bundler', 'src', 'setup-environment.ts'),
			'utf-8',
		),
	);
});
