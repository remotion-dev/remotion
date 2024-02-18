import {BrowserSafeApis} from '@remotion/renderer/client';
import {expect, test} from 'vitest';
import {Config} from '../config';

test('getChromiumOpenGlRenderer from Config - angle value', () => {
	Config.setChromiumOpenGlRenderer('angle');
	expect(BrowserSafeApis.options.glOption.getValue({commandLine: {}})).toEqual(
		'angle',
	);
});

test('getChromiumOpenGlRenderer from old Puppeter Config - egl value', () => {
	Config.setChromiumOpenGlRenderer('egl');
	expect(BrowserSafeApis.options.glOption.getValue({commandLine: {}})).toEqual(
		'egl',
	);
});

test('getChromiumOpenGlRenderer, override Puppeter Config - angle value', () => {
	Config.setChromiumOpenGlRenderer('egl');
	Config.setChromiumOpenGlRenderer('angle');
	expect(BrowserSafeApis.options.glOption.getValue({commandLine: {}})).toEqual(
		'angle',
	);
});
