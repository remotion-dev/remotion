import {afterEach, beforeEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	findCatalogSource,
	findVersionSpecifier,
	findWorkspaceRoot,
	getCatalogEntries,
	isCatalogProtocol,
	parsePnpmWorkspaceCatalog,
	updateCatalogEntry,
	updateCatalogEntryInPackageJson,
	updateCatalogEntryInPnpmWorkspace,
} from '../catalog-utils';

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-catalog-test-'));
});

afterEach(() => {
	fs.rmSync(tmpDir, {recursive: true, force: true});
});

test('isCatalogProtocol detects catalog: prefixes and rejects other version specifiers', () => {
	expect(isCatalogProtocol('catalog:')).toBe(true);
	expect(isCatalogProtocol('catalog:default')).toBe(true);
	expect(isCatalogProtocol('catalog:testing')).toBe(true);

	expect(isCatalogProtocol('^4.0.0')).toBe(false);
	expect(isCatalogProtocol('4.0.0')).toBe(false);
	expect(isCatalogProtocol('workspace:*')).toBe(false);
});

test('findVersionSpecifier finds packages across all dependency groups and returns null for unknown', () => {
	const depsWithVersions = {
		dependencies: {
			'@remotion/core': '^4.0.10',
			zod: 'catalog:',
		},
		devDependencies: {
			'@remotion/bundler': 'workspace:*',
			eslint: 'catalog:',
		},
		optionalDependencies: {
			sharp: '^0.34.0',
		},
		peerDependencies: {
			react: 'catalog:',
		},
	};

	expect(findVersionSpecifier(depsWithVersions, '@remotion/core')).toBe(
		'^4.0.10',
	);
	expect(findVersionSpecifier(depsWithVersions, '@remotion/bundler')).toBe(
		'workspace:*',
	);
	expect(findVersionSpecifier(depsWithVersions, 'sharp')).toBe('^0.34.0');
	expect(findVersionSpecifier(depsWithVersions, 'react')).toBe('catalog:');
	expect(findVersionSpecifier(depsWithVersions, 'nonexistent')).toBeNull();
});

test('parsePnpmWorkspaceCatalog handles basic, quoted, scoped entries and stops at next top-level key', () => {
	const richContent = [
		'packages:',
		'  - packages/*',
		'catalog:',
		'  react: ^18.3.1',
		'  zod: 4.4.3',
		'  "react-dom": "^18.3.1"',
		"  typescript: '5.8.3'",
		'  "@remotion/core": 4.0.10',
		'  "@aws-sdk/client-s3": 3.986.0',
		'catalogs:',
		'  testing:',
		'    jest: 30.0.0',
	].join('\n');

	const result = parsePnpmWorkspaceCatalog(richContent);
	expect(result.react).toBe('^18.3.1');
	expect(result.zod).toBe('4.4.3');
	expect(result['react-dom']).toBe('^18.3.1');
	expect(result.typescript).toBe('5.8.3');
	expect(result['@remotion/core']).toBe('4.0.10');
	expect(result['@aws-sdk/client-s3']).toBe('3.986.0');
	expect(result.jest).toBeUndefined();

	expect(parsePnpmWorkspaceCatalog('packages:\n  - packages/*\n')).toEqual({});
});

test('bun-style monorepo: finds workspace root, catalog source, and reads entries', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'package.json'),
		JSON.stringify({
			name: 'my-monorepo',
			workspaces: {
				packages: ['packages/*'],
				catalog: {
					react: '^19.0.0',
					zod: '4.4.3',
				},
			},
		}),
	);

	const subPkgDir = path.join(tmpDir, 'packages', 'my-app');
	fs.mkdirSync(subPkgDir, {recursive: true});
	fs.writeFileSync(
		path.join(subPkgDir, 'package.json'),
		JSON.stringify({name: 'my-app'}),
	);

	expect(findWorkspaceRoot(subPkgDir)).toBe(tmpDir);

	const source = findCatalogSource(tmpDir);
	expect(source).not.toBeNull();
	expect(source!.type).toBe('package-json');
	if (source!.type === 'package-json') {
		expect(source!.catalogKey).toBe('workspaces');
	}

	expect(getCatalogEntries(tmpDir)).toEqual({
		react: '^19.0.0',
		zod: '4.4.3',
	});
});

test('top-level catalog in package.json: finds catalog source and reads entries', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'package.json'),
		JSON.stringify({
			name: 'my-monorepo',
			catalog: {zod: '4.4.3'},
		}),
	);

	const source = findCatalogSource(tmpDir);
	expect(source).not.toBeNull();
	expect(source!.type).toBe('package-json');
	if (source!.type === 'package-json') {
		expect(source!.catalogKey).toBe('root');
	}

	expect(getCatalogEntries(tmpDir)).toEqual({zod: '4.4.3'});
});

test('pnpm monorepo: finds workspace root, catalog source, and reads entries', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'pnpm-workspace.yaml'),
		'packages:\n  - packages/*\ncatalog:\n  zod: 4.4.3\n  react: ^19.0.0\n',
	);

	const subPkgDir = path.join(tmpDir, 'packages', 'my-app');
	fs.mkdirSync(subPkgDir, {recursive: true});

	expect(findWorkspaceRoot(subPkgDir)).toBe(tmpDir);

	const source = findCatalogSource(tmpDir);
	expect(source).not.toBeNull();
	expect(source!.type).toBe('pnpm-workspace');

	expect(getCatalogEntries(tmpDir)).toEqual({
		zod: '4.4.3',
		react: '^19.0.0',
	});
});

test('standalone project: returns null/empty for workspace root, catalog source, and entries', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'package.json'),
		JSON.stringify({name: 'standalone-project'}),
	);

	const deepDir = path.join(tmpDir, 'a', 'b', 'c', 'd', 'e', 'f', 'g');
	fs.mkdirSync(deepDir, {recursive: true});

	expect(findWorkspaceRoot(deepDir)).toBeNull();
	expect(findCatalogSource(tmpDir)).toBeNull();
	expect(getCatalogEntries(tmpDir)).toEqual({});
});

test('updating catalog entries in bun-style package.json', () => {
	const filePath = path.join(tmpDir, 'package.json');
	fs.writeFileSync(
		filePath,
		JSON.stringify(
			{
				name: 'my-monorepo',
				workspaces: {
					packages: ['packages/*'],
					catalog: {
						react: '^18.0.0',
						zod: '4.4.3',
						mediabunny: '1.34.4',
					},
				},
			},
			null,
			'\t',
		) + '\n',
	);

	expect(
		updateCatalogEntryInPackageJson({
			filePath,
			catalogKey: 'workspaces',
			pkg: 'zod',
			newVersion: '4.4.0',
		}),
	).toBe(true);

	const afterZodUpdate = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	expect(afterZodUpdate.workspaces.catalog.zod).toBe('4.4.0');
	expect(afterZodUpdate.workspaces.catalog.react).toBe('^18.0.0');

	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'mediabunny',
			newVersion: '1.35.0',
		}),
	).toBe(true);

	const afterBothUpdates = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	expect(afterBothUpdates.workspaces.catalog.mediabunny).toBe('1.35.0');
	expect(afterBothUpdates.workspaces.catalog.react).toBe('^18.0.0');

	expect(
		updateCatalogEntryInPackageJson({
			filePath,
			catalogKey: 'workspaces',
			pkg: 'nonexistent',
			newVersion: '1.0.0',
		}),
	).toBe(false);
});

test('updating catalog entries in top-level package.json catalog', () => {
	const filePath = path.join(tmpDir, 'package.json');
	fs.writeFileSync(
		filePath,
		JSON.stringify(
			{
				name: 'my-monorepo',
				catalog: {zod: '4.4.3', mediabunny: '1.34.4'},
			},
			null,
			'\t',
		) + '\n',
	);

	expect(
		updateCatalogEntryInPackageJson({
			filePath,
			catalogKey: 'root',
			pkg: 'mediabunny',
			newVersion: '1.35.0',
		}),
	).toBe(true);

	const updated = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
	expect(updated.catalog.mediabunny).toBe('1.35.0');
	expect(updated.catalog.zod).toBe('4.4.3');
});

test('updating catalog entries in pnpm-workspace.yaml', () => {
	const filePath = path.join(tmpDir, 'pnpm-workspace.yaml');
	fs.writeFileSync(
		filePath,
		[
			'packages:',
			'  - packages/*',
			'catalog:',
			'  react: ^18.3.1',
			'  zod: 4.4.3',
			'  "react-dom": "^18.3.1"',
			'  "@aws-sdk/client-s3": 3.986.0',
			'catalogs:',
			'  testing:',
			'    jest: 30.0.0',
			'',
		].join('\n'),
	);

	expect(
		updateCatalogEntryInPnpmWorkspace({
			filePath,
			pkg: 'zod',
			newVersion: '4.4.0',
		}),
	).toBe(true);

	let content = fs.readFileSync(filePath, 'utf-8');
	expect(content).toContain('zod: 4.4.0');
	expect(content).toContain('react: ^18.3.1');

	expect(
		updateCatalogEntryInPnpmWorkspace({
			filePath,
			pkg: 'react-dom',
			newVersion: '^19.0.0',
		}),
	).toBe(true);

	content = fs.readFileSync(filePath, 'utf-8');
	expect(content).toContain('"react-dom": "^19.0.0"');

	expect(
		updateCatalogEntryInPnpmWorkspace({
			filePath,
			pkg: '@aws-sdk/client-s3',
			newVersion: '3.987.0',
		}),
	).toBe(true);

	content = fs.readFileSync(filePath, 'utf-8');
	expect(content).toContain('"@aws-sdk/client-s3": 3.987.0');
	expect(content).toContain('jest: 30.0.0');

	expect(
		updateCatalogEntryInPnpmWorkspace({
			filePath,
			pkg: 'nonexistent',
			newVersion: '1.0.0',
		}),
	).toBe(false);

	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'react',
			newVersion: '^19.0.0',
		}),
	).toBe(true);

	content = fs.readFileSync(filePath, 'utf-8');
	expect(content).toContain('react: ^19.0.0');
});

test('updateCatalogEntry returns false when no catalog source exists', () => {
	fs.writeFileSync(
		path.join(tmpDir, 'package.json'),
		JSON.stringify({name: 'standalone'}),
	);

	expect(
		updateCatalogEntry({
			workspaceRoot: tmpDir,
			pkg: 'zod',
			newVersion: '4.4.0',
		}),
	).toBe(false);
});
