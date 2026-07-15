import {expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {DEFAULT_TIMELINE_TRACKS} from '@remotion/studio-shared';
import {Config, ConfigInternals} from '../config';

test('reset config options restores defaults before reloading config', async () => {
	ConfigInternals.resetConfigOptions();

	Config.setStudioPort(4321);
	Config.setMaxTimelineTracks(123);
	Config.setChromiumOpenGlRenderer('angle');
	Config.setBufferStateDelayInMilliseconds(200);
	Config.overrideWebpackConfig((config) => ({
		...config,
		name: 'first',
	}));
	Config.overrideWebpackConfig((config) => ({
		...config,
		devtool: 'source-map',
	}));

	expect(ConfigInternals.getStudioPort()).toBe(4321);
	expect(StudioServerInternals.getMaxTimelineTracks()).toBe(123);
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toBe('angle');
	expect(ConfigInternals.getBufferStateDelayInMilliseconds()).toBe(200);
	expect(
		await ConfigInternals.getWebpackOverrideFn()({mode: 'development'}),
	).toEqual({mode: 'development', name: 'first', devtool: 'source-map'});

	ConfigInternals.resetConfigOptions();

	expect(ConfigInternals.getStudioPort()).toBeUndefined();
	expect(StudioServerInternals.getMaxTimelineTracks()).toBe(
		DEFAULT_TIMELINE_TRACKS,
	);
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toBeNull();
	expect(ConfigInternals.getBufferStateDelayInMilliseconds()).toBeNull();
	expect(
		await ConfigInternals.getWebpackOverrideFn()({mode: 'development'}),
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
