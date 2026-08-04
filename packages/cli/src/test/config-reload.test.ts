import {afterEach, expect, spyOn, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {BrowserSafeApis} from '@remotion/renderer/client';
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

const reloadTestConfig = () =>
	reloadConfig({
		resetConfigOptions: ConfigInternals.resetConfigOptions,
		getConfigSnapshot: () => null,
	});

test('an invalid config reload keeps the previous configuration', async () => {
	process.env.PATCH_BUN_DEVELOPMENT = '1';
	Object.assign(globalThis, {
		require: createRequire(path.join(__dirname, '..', 'load-config.ts')),
	});
	temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'remotion-config-'));
	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(4321); Config.setDefaultEditor('cursor'); Config.setDefaultCodingAgent('codex');`,
	);

	await loadConfig(temporaryDirectory);
	expect(ConfigInternals.getStudioPort()).toBe(4321);
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toBe('cursor');
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBe('codex');

	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(5678); Config.setDefaultEditor('windsurf'); Config.setDefaultCodingAgent('cursor'); throw new Error('Invalid config');`,
	);
	expect((await reloadTestConfig()).type).toBe('error');
	expect(ConfigInternals.getStudioPort()).toBe(4321);
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toBe('cursor');
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBe('codex');

	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(5678); Config.setDefaultEditor('windsurf'); Config.setDefaultCodingAgent('cursor');`,
	);
	const snapshotErrorMessage = 'The derived config snapshot was rejected';
	expect(
		await reloadConfig({
			resetConfigOptions: ConfigInternals.resetConfigOptions,
			getConfigSnapshot: () => {
				throw new Error(snapshotErrorMessage);
			},
		}),
	).toEqual({type: 'error', errorMessage: snapshotErrorMessage});
	expect(ConfigInternals.getStudioPort()).toBe(4321);
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toBe('cursor');
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBe('codex');

	writeConfig('this is not valid JavaScript }');
	expect((await reloadTestConfig()).type).toBe('error');
	expect(ConfigInternals.getStudioPort()).toBe(4321);

	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(6789); Config.setDefaultEditor({type: 'custom', name: 'Acme Editor', executable: '/opt/acme/editor', arguments: ['--goto', '%TARGET_PATH%:%LINE_NUMBER%:%COLUMN_NUMBER%']}); Config.setDefaultCodingAgent('claude-code');`,
	);
	expect((await reloadTestConfig()).type).toBe('success');
	expect(ConfigInternals.getStudioPort()).toBe(6789);
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toEqual({
		type: 'custom',
		name: 'Acme Editor',
		executable: '/opt/acme/editor',
		arguments: ['--goto', '%TARGET_PATH%:%LINE_NUMBER%:%COLUMN_NUMBER%'],
	});
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBe('claude-code');

	writeConfig(
		`const {Config} = require('@remotion/cli/config'); Config.setStudioPort(7890);`,
	);
	expect((await reloadTestConfig()).type).toBe('success');
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toBeNull();
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBeNull();
});

test('warns when the bundler-specific override does not match the selected bundler', async () => {
	process.env.PATCH_BUN_DEVELOPMENT = '1';
	Object.assign(globalThis, {
		require: createRequire(path.join(__dirname, '..', 'load-config.ts')),
	});
	temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'remotion-config-'));
	const warn = spyOn(console, 'warn').mockImplementation(() => undefined);

	try {
		writeConfig(
			`const {Config} = require('@remotion/cli/config'); Config.overrideWebpackConfig((config) => config); Config.setRspack(true);`,
		);
		await loadConfig(temporaryDirectory);
		expect(warn.mock.calls.flat().join(' ')).toContain(
			'You have selected Rspack as the bundler, but Config.overrideWebpackConfig() was called. The Webpack override will be ignored. Use Config.overrideRspackConfig() or Config.overrideBundlerConfig() instead.',
		);

		warn.mockClear();
		writeConfig(
			`const {Config} = require('@remotion/cli/config'); Config.setRspack(false); Config.overrideRspackConfig((config) => config);`,
		);
		expect((await reloadTestConfig()).type).toBe('success');
		expect(warn.mock.calls.flat().join(' ')).toContain(
			'You have selected Webpack as the bundler, but Config.overrideRspackConfig() was called. The Rspack override will be ignored. Use Config.overrideWebpackConfig() or Config.overrideBundlerConfig() instead.',
		);

		warn.mockClear();
		writeConfig(
			`const {Config} = require('@remotion/cli/config'); Config.setRspack(true); Config.overrideRspackConfig((config) => config); Config.overrideBundlerConfig((config) => config);`,
		);
		expect((await reloadTestConfig()).type).toBe('success');
		expect(warn.mock.calls.length).toBe(0);

		warn.mockClear();
		writeConfig(
			`const {Config} = require('@remotion/cli/config'); Config.setRspack(false); Config.overrideWebpackConfig((config) => config); Config.overrideBundlerConfig((config) => config);`,
		);
		expect((await reloadTestConfig()).type).toBe('success');
		expect(warn.mock.calls.length).toBe(0);
	} finally {
		warn.mockRestore();
	}
});
