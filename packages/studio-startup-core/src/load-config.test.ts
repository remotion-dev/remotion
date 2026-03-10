import {afterEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Config, ConfigInternals} from './config';
import {loadConfig} from './load-config';

const tempRoots: string[] = [];

afterEach(() => {
	delete process.env.LOAD_CONFIG_PLUGIN_MARKER;
	Config.setExperimentalClientSideRenderingEnabled(false);
	Config.setExperimentalVisualMode(false);

	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, {recursive: true, force: true});
	}
});

function createTempProject(): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-load-config-'));
	tempRoots.push(root);
	return root;
}

test('loadConfig resolves external packages from the Remotion root', async () => {
	const root = createTempProject();

	fs.writeFileSync(
		path.join(root, 'tsconfig.json'),
		JSON.stringify({compilerOptions: {target: 'ES2020'}}, null, '\t'),
	);

	fs.mkdirSync(path.join(root, 'node_modules', 'example-plugin'), {
		recursive: true,
	});
	fs.writeFileSync(
		path.join(root, 'node_modules', 'example-plugin', 'package.json'),
		JSON.stringify({name: 'example-plugin', main: 'index.js'}, null, '\t'),
	);
	fs.writeFileSync(
		path.join(root, 'node_modules', 'example-plugin', 'index.js'),
		'process.env.LOAD_CONFIG_PLUGIN_MARKER = "loaded";\n',
	);
	fs.writeFileSync(
		path.join(root, 'remotion.config.ts'),
		'import "example-plugin";\n',
	);

	const configPath = await loadConfig({remotionRoot: root});

	expect(configPath).toBe(path.join(root, 'remotion.config.ts'));
	expect(process.env.LOAD_CONFIG_PLUGIN_MARKER).toBe('loaded');
});

test('loadConfig applies experimental Studio flags from config files', async () => {
	const root = createTempProject();

	fs.writeFileSync(
		path.join(root, 'tsconfig.json'),
		JSON.stringify({compilerOptions: {target: 'ES2020'}}, null, '\t'),
	);
	fs.writeFileSync(
		path.join(root, 'remotion.config.ts'),
		[
			'import {Config} from "@remotion/cli/config";',
			'Config.setExperimentalClientSideRenderingEnabled(true);',
			'Config.setExperimentalVisualMode(true);',
		].join('\n'),
	);

	await loadConfig({remotionRoot: root});

	expect(
		ConfigInternals.getConfiguredExperimentalClientSideRenderingEnabled(),
	).toBe(true);
	expect(ConfigInternals.getConfiguredExperimentalVisualModeEnabled()).toBe(
		true,
	);
});
