import {expect, test} from 'bun:test';
import {LightLeakInternals, lightLeak} from '../index.js';
import {lightLeakSchema} from '../LightLeak.js';

test('<LightLeak> exposes background and border controls', () => {
	expect('style.backgroundColor' in lightLeakSchema).toBe(true);
	expect('style.borderWidth' in lightLeakSchema).toBe(true);
	expect('style.borderStyle' in lightLeakSchema).toBe(true);
	expect('style.borderColor' in lightLeakSchema).toBe(true);
});

test('@remotion/light-leaks re-exports the migrated effect', () => {
	expect(LightLeakInternals.lightLeak).toBe(lightLeak);
	expect(lightLeak().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/effects/light-leak',
	);
});
