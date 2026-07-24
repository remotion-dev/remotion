import {afterEach, expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {ConfigInternals} from '../config';
import {loadConfig, reloadConfig} from '../get-config-file-name';

let temporaryDirectory: string | null = null;

afterEach(() => {
	ConfigInternals.resetConfigOptions();
	delete process.env.PATCH_BUN_DEVELOPMENT;
	Reflect.deleteProperty(globalThis, 'require');
	if (temporaryDirectory) {
		rmSync(temporaryDirectory, {recursive: true});
		temporaryDirectory = null;
	}
});

const writeConfig = (contents: string) => {
	if (!temporaryDirectory) {
		throw new Error('Temporary directory was not created');
	}

	writeFileSync(path.join(temporaryDirectory, 'remotion.config.js'), contents);
};

test('an invalid config reload keeps the previous configuration', async () => {
	process.env.PATCH_BUN_DEVELOPMENT = '1';
	Object.assign(globalThis, {
		require: createRequire(path.join(__dirname, '..', 'load-config.ts')),
	});
	temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'remotion-config-'));
	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(4321);`,
	);

	await loadConfig(temporaryDirectory);
	expect(ConfigInternals.getStudioPort()).toBe(4321);

	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(5678); throw new Error('Invalid config');`,
	);
	expect(
		await reloadConfig({
			resetConfigOptions: ConfigInternals.resetConfigOptions,
		}),
	).toBe(false);
	expect(ConfigInternals.getStudioPort()).toBe(4321);

	writeConfig('this is not valid JavaScript }');
	expect(
		await reloadConfig({
			resetConfigOptions: ConfigInternals.resetConfigOptions,
		}),
	).toBe(false);
	expect(ConfigInternals.getStudioPort()).toBe(4321);

	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(6789);`,
	);
	expect(
		await reloadConfig({
			resetConfigOptions: ConfigInternals.resetConfigOptions,
		}),
	).toBe(true);
	expect(ConfigInternals.getStudioPort()).toBe(6789);
});
