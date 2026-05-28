import {expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Config} from '../config';
import {parsedCli} from '../parsed-cli';

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

test('getChromiumDarkMode does not default to a CLI value', () => {
	expect(parsedCli['dark-mode']).toEqual(null);
});
