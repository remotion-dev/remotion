import {expect, test} from 'bun:test';
import {existsSync, readFileSync} from 'fs';
import path from 'path';
import {getAllPackages} from './get-all-packages';

test('All monorepo packages need to have workspace:* as remotion version', () => {
	const folders = getAllPackages();

	let deps = 0;
	for (const folder of folders) {
		const json = readFileSync(folder.path, 'utf-8');

		const packageJson = JSON.parse(json);
		const {
			dependencies,
			devDependencies,
			peerDependencies,
			optionalDependencies,
		} = packageJson;

		const allDeps = {
			...dependencies,
			...devDependencies,
			...peerDependencies,
			...optionalDependencies,
		};

		const onlyRemotionDeps = Object.keys(allDeps).filter(
			(dep) => dep.startsWith('@remotion') || dep === 'remotion',
		);

		for (const dep of onlyRemotionDeps) {
			expect(
				allDeps[dep] === 'workspace:*' || allDeps[dep].includes('remotion.pro'),
			).toBeTruthy();
			deps++;
		}
	}
	expect(deps).toBeGreaterThan(75);
});

test('All monorepo packages should have the same "version" field', () => {
	const packages = getAllPackages();

	const versions = new Set<string>();

	for (const folder of packages) {
		if (!existsSync(folder.path)) {
			continue;
		}

		const json = readFileSync(folder.path, 'utf-8');

		const packageJson = JSON.parse(json);
		versions.add(packageJson.version);
	}
	if (versions.size > 1) {
		console.log('Versions', versions);
	}
	expect(versions.size).toBe(1);
});

test('All agent plugin manifests should match the Remotion version', () => {
	const packagesRoot = path.join(__dirname, '..', '..', '..');
	const remotionVersion = JSON.parse(
		readFileSync(path.join(packagesRoot, 'core', 'package.json'), 'utf-8'),
	).version;
	const pluginManifestPaths = [
		path.join('agent-plugin', 'plugin.json'),
		path.join('agent-plugin', '.codex-plugin', 'plugin.json'),
		path.join('claude-code-plugin', '.claude-plugin', 'plugin.json'),
		path.join('kimi-code-plugin', '.kimi-plugin', 'plugin.json'),
	];

	for (const pluginManifestPath of pluginManifestPaths) {
		const manifest = JSON.parse(
			readFileSync(path.join(packagesRoot, pluginManifestPath), 'utf-8'),
		);
		expect(manifest.version).toBe(remotionVersion);
	}
});
