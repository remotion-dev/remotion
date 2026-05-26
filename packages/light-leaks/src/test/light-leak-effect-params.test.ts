import {expect, test} from 'bun:test';
import {LightLeakInternals} from '../light-leak-internals.js';

test('lightLeak() exposes its API name as the Studio label', () => {
	expect(LightLeakInternals.lightLeak().definition.label).toBe('lightLeak()');
});
