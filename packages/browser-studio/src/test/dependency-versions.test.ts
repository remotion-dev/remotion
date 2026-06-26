import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getBrowserStudioDependencyVersionsForBuild} from '../dev/get-dependency-versions-for-build';

type PackageJson = {
	readonly version?: string;
	readonly workspaces?: {
		readonly catalog?: Record<string, string>;
	};
};

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoDir = join(packageDir, '..', '..');

const readPackageJson = (path: string): PackageJson =>
	JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;

test('browser studio dependency versions are derived from package metadata', () => {
	const rootPackageJson = readPackageJson(join(repoDir, 'package.json'));
	const studioPackageJson = readPackageJson(
		join(repoDir, 'packages', 'studio', 'package.json'),
	);
	const dependencyVersions = getBrowserStudioDependencyVersionsForBuild();
	const reactVersion = rootPackageJson.workspaces?.catalog?.react;
	const reactDomVersion = rootPackageJson.workspaces?.catalog?.['react-dom'];

	if (!studioPackageJson.version || !reactVersion || !reactDomVersion) {
		throw new Error(
			'Could not find package metadata for dependency version test',
		);
	}

	expect(dependencyVersions['@remotion/studio']).toBe(
		studioPackageJson.version,
	);
	expect(dependencyVersions.react).toBe(reactVersion);
	expect(dependencyVersions['react-dom']).toBe(reactDomVersion);
	expect(dependencyVersions.memfs).toBeUndefined();
	expect(dependencyVersions.open).toBeUndefined();
	expect(
		Object.values(dependencyVersions).every(
			(version) =>
				!version.startsWith('workspace:') && !version.startsWith('catalog:'),
		),
	).toBe(true);
});
