import {expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Config} from '../config';

test('getChromiumOpenGlRenderer from Config - angle value', () => {
	Config.setChromiumOpenGlRenderer('angle');
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toEqual('angle');
});

test('getChromiumOpenGlRenderer from old Puppeter Config - egl value', () => {
	Config.setChromiumOpenGlRenderer('egl');
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toEqual('egl');
});

test('getChromiumOpenGlRenderer, override Puppeter Config - angle value', () => {
	Config.setChromiumOpenGlRenderer('egl');
	Config.setChromiumOpenGlRenderer('angle');
	expect(
		BrowserSafeApis.options.glOption.getValue({commandLine: {}}).value,
	).toEqual('angle');
});

test('getChromiumDarkMode respects the config file if the CLI flag is absent', () => {
	Config.setChromiumDarkMode(true);
	expect(
		BrowserSafeApis.options.darkModeOption.getValue({
			commandLine: {'dark-mode': null},
		}).value,
	).toEqual(true);
	expect(
		BrowserSafeApis.options.darkModeOption.getValue({
			commandLine: {'dark-mode': false},
		}).value,
	).toEqual(false);
	Config.setChromiumDarkMode(false);
});
