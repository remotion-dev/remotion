import {expect, test} from 'vitest';
import {Config} from '../config';

import {getChromiumOpenGlRenderer} from '../config/chromium-flags';

test('getChromiumOpenGlRenderer from Config - angle value', () => {
	Config.setChromiumOpenGlRenderer('angle');
	expect(getChromiumOpenGlRenderer()).toEqual('angle');
});

test('getChromiumOpenGlRenderer from old Puppeter Config - egl value', () => {
	Config.setChromiumOpenGlRenderer('egl');
	expect(getChromiumOpenGlRenderer()).toEqual('egl');
});

test('getChromiumOpenGlRenderer, override Puppeter Config - angle value', () => {
	Config.setChromiumOpenGlRenderer('egl');
	Config.setChromiumOpenGlRenderer('angle');
	expect(getChromiumOpenGlRenderer()).toEqual('angle');
});
