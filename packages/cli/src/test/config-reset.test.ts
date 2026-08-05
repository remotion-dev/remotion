import {expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {DEFAULT_TIMELINE_TRACKS} from '@remotion/studio-shared';
import type {RspackConfiguration, WebpackConfiguration} from '../config';
import {Config, ConfigInternals} from '../config';
import {getRenderDefaults} from '../get-render-defaults';

test('Studio render defaults keep the startup log level', () => {
	ConfigInternals.resetConfigOptions();
	Config.setLogLevel('verbose');

	expect(getRenderDefaults('warn').logLevel).toBe('warn');
});

test('Rspack can be configured using the current and deprecated APIs', () => {
	ConfigInternals.resetConfigOptions();

	expect(
		BrowserSafeApis.options.rspackOption.getValue({commandLine: {}}).value,
	).toBe(false);

	Config.setRspack(true);
	expect(
		BrowserSafeApis.options.rspackOption.getValue({commandLine: {}}).value,
	).toBe(true);

	Config.setExperimentalRspackEnabled(false);
	expect(
		BrowserSafeApis.options.rspackOption.getValue({commandLine: {}}).value,
	).toBe(false);
});

test('reset config options restores defaults before reloading config', async () => {
	ConfigInternals.resetConfigOptions();

	Config.setStudioPort(4321);
	Config.setMaxTimelineTracks(123);
	Config.setChromiumOpenGlRenderer('angle');
	Config.setDefaultCodingAgent('codex');
	Config.setDefaultEditor('cursor');
	Config.setBufferStateDelayInMilliseconds(200);
	Config.overrideBundlerConfig((config, {bundler}) => ({
		...config,
		name: `shared-${bundler}`,
	}));
	Config.overrideWebpackConfig((config) => ({
		...config,
		name: `${config.name}-webpack`,
	}));
	Config.overrideWebpackConfig((config) => ({
		...config,
		devtool: 'source-map',
	}));
	Config.overrideRspackConfig((config) => ({
		...config,
		name: `${config.name}-rspack`,
	}));

	expect(ConfigInternals.getStudioPort()).toBe(4321);
	expect(StudioServerInternals.getMaxTimelineTracks()).toBe(123);
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toBe('angle');
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBe('codex');
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toBe('cursor');
	expect(ConfigInternals.getBufferStateDelayInMilliseconds()).toBe(200);
	const sharedWebpackConfig = await ConfigInternals.getBundlerOverrideFn()(
		{mode: 'development'},
		{bundler: 'webpack'},
	);
	expect(
		await ConfigInternals.getWebpackOverrideFn()(
			sharedWebpackConfig as WebpackConfiguration,
		),
	).toEqual({
		mode: 'development',
		name: 'shared-webpack-webpack',
		devtool: 'source-map',
	});
	const sharedRspackConfig = await ConfigInternals.getBundlerOverrideFn()(
		{mode: 'development'},
		{bundler: 'rspack'},
	);
	expect(
		await ConfigInternals.getRspackOverrideFn()(
			sharedRspackConfig as RspackConfiguration,
		),
	).toEqual({
		mode: 'development',
		name: 'shared-rspack-rspack',
	});

	ConfigInternals.resetConfigOptions();

	expect(ConfigInternals.getStudioPort()).toBeUndefined();
	expect(StudioServerInternals.getMaxTimelineTracks()).toBe(
		DEFAULT_TIMELINE_TRACKS,
	);
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toBeNull();
	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {},
		}).value,
	).toBeNull();
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({commandLine: {}})
			.value,
	).toBeNull();
	expect(ConfigInternals.getBufferStateDelayInMilliseconds()).toBeNull();
	expect(
		await ConfigInternals.getBundlerOverrideFn()(
			{mode: 'development'},
			{bundler: 'webpack'},
		),
	).toEqual({mode: 'development'});
	expect(
		await ConfigInternals.getWebpackOverrideFn()({mode: 'development'}),
	).toEqual({mode: 'development'});
	expect(
		await ConfigInternals.getRspackOverrideFn()({mode: 'development'}),
	).toEqual({mode: 'development'});
	expect(
		BrowserSafeApis.options.askAIOption.getValue({commandLine: {}}).value,
	).toBe(true);
	expect(
		BrowserSafeApis.options.jpegQualityOption.getValue({commandLine: {}}).value,
	).toBe(80);
	expect(
		BrowserSafeApis.options.noOpenOption.getValue({commandLine: {}}).value,
	).toBe(false);
	expect(
		BrowserSafeApis.options.overwriteOption.getValue({commandLine: {}}, true)
			.value,
	).toBe(true);
});

test('CLI app flags take precedence over the configured defaults', () => {
	ConfigInternals.resetConfigOptions();
	Config.setDefaultCodingAgent('codex');
	Config.setDefaultEditor({
		type: 'custom',
		name: 'Acme Editor',
		executable: '/opt/acme/editor',
		arguments: ['--goto', '%TARGET_PATH%:%LINE_NUMBER%:%COLUMN_NUMBER%'],
	});

	expect(
		BrowserSafeApis.options.defaultCodingAgentOption.getValue({
			commandLine: {'coding-agent': 'cursor'},
		}),
	).toEqual({source: 'cli', value: 'cursor'});
	expect(
		BrowserSafeApis.options.defaultEditorOption.getValue({
			commandLine: {editor: 'zed'},
		}),
	).toEqual({source: 'cli', value: 'zed'});
	expect(() => Config.setDefaultCodingAgent('invalid' as 'codex')).toThrow(
		'Config.setDefaultCodingAgent() must be one of',
	);
	expect(() => Config.setDefaultEditor('invalid' as 'cursor')).toThrow(
		'Config.setDefaultEditor() must be one of',
	);
	expect(() =>
		Config.setDefaultEditor({
			type: 'custom',
			name: 'Acme Editor',
			executable: '/opt/acme/editor',
			arguments: ['--goto'],
		}),
	).toThrow('Custom editor arguments must include %TARGET_PATH%');
});

test('bundler overrides can be fixed at Studio startup', async () => {
	ConfigInternals.resetConfigOptions();
	Config.overrideBundlerConfig((config) => ({...config, name: 'startup'}));
	Config.overrideRspackConfig((config) => ({
		...config,
		devtool: 'source-map',
	}));

	const startupBundlerOverride = ConfigInternals.getBundlerOverrideFn();
	const startupRspackOverride = ConfigInternals.getRspackOverrideFn();

	Config.overrideBundlerConfig((config) => ({...config, name: 'reloaded'}));
	Config.overrideRspackConfig((config) => ({...config, devtool: false}));

	const sharedConfig = await startupBundlerOverride(
		{mode: 'development'},
		{bundler: 'rspack'},
	);
	expect(
		await startupRspackOverride(sharedConfig as RspackConfiguration),
	).toEqual({
		mode: 'development',
		name: 'startup',
		devtool: 'source-map',
	});
});
