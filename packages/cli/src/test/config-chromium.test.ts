import {BrowserSafeApis} from '@remotion/renderer/client';
import {expect, test} from 'bun:test';
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
