import {afterEach, beforeEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	findVersionSpecifier,
	isCatalogProtocol,
	updateCatalogEntry,
} from '../catalog-utils';
import {getPackagesToUpgrade} from '../upgrade';

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(
		path.join(os.tmpdir(), 'remotion-upgrade-proto-test-'),
	);
});

afterEach(() => {
	fs.rmSync(tmpDir, {recursive: true, force: true});
});

const partitionPackages = (
	depsWithVersions: {
		dependencies: Record<string, string>;
		devDependencies: Record<string, string>;
		optionalDependencies: Record<string, string>;
		peerDependencies: Record<string, string>;
	},
	packagesToUpgrade: string[],
	targetVersion: string,
) => {
	const normalPackages: {pkg: string; version: string}[] = [];
	const catalogPackages: {pkg: string; version: string}[] = [];

	for (const pkg of packagesToUpgrade) {
		const versionSpec = findVersionSpecifier(depsWithVersions, pkg);

		if (versionSpec && isCatalogProtocol(versionSpec)) {
			catalogPackages.push({pkg, version: targetVersion});
		} else {
			normalPackages.push({pkg, version: targetVersion});
		}
	}

	return {normalPackages, catalogPackages};
};

test('partitions packages into normal and catalog groups', () => {
	const depsWithVersions = {
		dependencies: {
			'@remotion/core': '^4.0.10',
			'@remotion/player': '4.0.10',
			zod: 'catalog:',
			mediabunny: 'catalog:',
		},
		devDependencies: {
			'@remotion/eslint-config': 'catalog:default',
			jest: 'catalog:testing',
		},
		optionalDependencies: {},
		peerDependencies: {},
	};

	const semverResult = partitionPackages(
		depsWithVersions,
		['@remotion/core', '@remotion/player'],
		'4.0.15',
	);
	expect(semverResult.normalPackages).toEqual([
		{pkg: '@remotion/core', version: '4.0.15'},
		{pkg: '@remotion/player', version: '4.0.15'},
	]);
	expect(semverResult.catalogPackages).toEqual([]);

	const catalogResult = partitionPackages(
		depsWithVersions,
		['zod', 'mediabunny', '@remotion/eslint-config'],
		'4.0.15',
	);
	expect(catalogResult.normalPackages).toEqual([]);
	expect(catalogResult.catalogPackages).toEqual([
		{pkg: 'zod', version: '4.0.15'},
		{pkg: 'mediabunny', version: '4.0.15'},
		{pkg: '@remotion/eslint-config', version: '4.0.15'},
	]);

	const mixedResult = partitionPackages(
		depsWithVersions,
		['@remotion/core', 'zod', '@remotion/player', 'mediabunny'],
		'4.0.15',
	);
	expect(mixedResult.normalPackages).toEqual([
		{pkg: '@remotion/core', version: '4.0.15'},
		{pkg: '@remotion/player', version: '4.0.15'},
	]);
	expect(mixedResult.catalogPackages).toEqual([
		{pkg: 'zod', version: '4.0.15'},
		{pkg: 'mediabunny', version: '4.0.15'},
	]);

	const emptyDeps = {
		dependencies: {},
		devDependencies: {},
		optionalDependencies: {},
		peerDependencies: {},
	};
	const unknownResult = partitionPackages(
		emptyDeps,
		['@remotion/core'],
		'4.0.15',
	);
	expect(unknownResult.normalPackages).toEqual([
		{pkg: '@remotion/core', version: '4.0.15'},
	]);
});

test('includes Remotion and extra packages that only exist in pnpm catalog entries', () => {
	const result = getPackagesToUpgrade({
		depsWithVersions: {
			dependencies: {},
			devDependencies: {},
			optionalDependencies: {},
			peerDependencies: {},
		},
		catalogEntries: {
			remotion: '4.0.460',
			'@remotion/player': '4.0.460',
			mediabunny: '1.44.0',
			react: '19.0.0',
		},
		targetVersion: '4.0.462',
		extraPackageVersions: {
			mediabunny: '1.45.0',
			zod: '4.3.6',
		},
	});

	expect(result.normalPackages).toEqual([]);
	expect(result.catalogPackages).toEqual([
		{pkg: 'remotion', version: '4.0.462'},
		{pkg: '@remotion/player', version: '4.0.462'},
		{pkg: 'mediabunny', version: '1.45.0'},
	]);
});

test('end-to-end: updates catalog in bun-style package.json and preserves catalog: references in sub-packages', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'package.json'),
		JSON.stringify(
			{
				name: 'my-monorepo',
				workspaces: {
					packages: ['packages/*'],
					catalog: {
						zod: '4.3.6',
						mediabunny: '1.34.4',
						react: '19.2.3',
					},
				},
			},
			null,
			'\t',
		) + '\n',
	);

	const subPkgDir = path.join(tmpDir, 'packages', 'my-app');
	fs.mkdirSync(subPkgDir, {recursive: true});
	fs.writeFileSync(
		path.join(subPkgDir, 'package.json'),
		JSON.stringify({
			name: 'my-app',
			dependencies: {
				'@remotion/core': '^4.0.10',
				zod: 'catalog:',
			},
			devDependencies: {
				mediabunny: 'catalog:',
			},
		}),
	);

	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'zod',
			newVersion: '4.4.0',
		}),
	).toBe(true);
	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'mediabunny',
			newVersion: '1.35.0',
		}),
	).toBe(true);

	const updatedRoot = JSON.parse(
		fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
	);
	expect(updatedRoot.workspaces.catalog.zod).toBe('4.4.0');
	expect(updatedRoot.workspaces.catalog.mediabunny).toBe('1.35.0');
	expect(updatedRoot.workspaces.catalog.react).toBe('19.2.3');

	const subPkg = JSON.parse(
		fs.readFileSync(path.join(subPkgDir, 'package.json'), 'utf-8'),
	);
	expect(subPkg.dependencies.zod).toBe('catalog:');
	expect(subPkg.devDependencies.mediabunny).toBe('catalog:');
});

test('end-to-end: updates catalog in pnpm-workspace.yaml', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'package.json'),
		JSON.stringify({name: 'my-monorepo'}),
	);
	fs.writeFileSync(
		path.join(tmpDir, 'pnpm-workspace.yaml'),
		[
			'packages:',
			'  - packages/*',
			'catalog:',
			'  zod: 4.3.6',
			'  mediabunny: 1.34.4',
			'  react: ^19.0.0',
			'',
		].join('\n'),
	);

	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'zod',
			newVersion: '4.4.0',
		}),
	).toBe(true);
	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'mediabunny',
			newVersion: '1.35.0',
		}),
	).toBe(true);

	const content = fs.readFileSync(
		path.join(tmpDir, 'pnpm-workspace.yaml'),
		'utf-8',
	);
	expect(content).toContain('zod: 4.4.0');
	expect(content).toContain('mediabunny: 1.35.0');
	expect(content).toContain('react: ^19.0.0');
});
