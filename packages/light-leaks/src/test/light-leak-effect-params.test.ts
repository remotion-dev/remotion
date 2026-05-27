import {expect, test} from 'bun:test';
import {LightLeakInternals, lightLeak} from '../light-leak-internals.js';

test('lightLeak() accepts default params', () => {
	expect(() => lightLeak()).not.toThrow();
	expect(lightLeak().effectKey).toContain('light-leak-0-0-0.5');
});

test('lightLeak() exposes its documentation link', () => {
	expect(lightLeak().definition.documentationLink).toBe(
		'https://www.remotion.dev/docs/light-leaks/light-leak-effect',
	);
});

test('lightLeak() exposes its API name as the Studio label', () => {
	expect(lightLeak().definition.label).toBe('lightLeak()');
});

test('LightLeakInternals.lightLeak points to lightLeak()', () => {
	expect(LightLeakInternals.lightLeak).toBe(lightLeak);
});

test('lightLeak() rejects non-finite seed', () => {
	expect(() => lightLeak({seed: Number.NaN})).toThrow(
		'"seed" must be a finite number',
	);
});

test('lightLeak() rejects hueShift below range', () => {
	expect(() => lightLeak({hueShift: -1})).toThrow('"hueShift" must be >= 0');
});

test('lightLeak() rejects hueShift above range', () => {
	expect(() => lightLeak({hueShift: 361})).toThrow('"hueShift" must be <= 360');
});

test('lightLeak() rejects progress below range', () => {
	expect(() => lightLeak({progress: -0.1})).toThrow('"progress" must be >= 0');
});

test('lightLeak() rejects progress above range', () => {
	expect(() => lightLeak({progress: 1.1})).toThrow('"progress" must be <= 1');
});

test('lightLeak() parameters produce distinct effect keys', () => {
	const defaults = lightLeak();
	const seeded = lightLeak({seed: 1});
	const shifted = lightLeak({hueShift: 30});
	const progressed = lightLeak({progress: 0.25});

	expect(
		new Set([
			defaults.effectKey,
			seeded.effectKey,
			shifted.effectKey,
			progressed.effectKey,
		]).size,
	).toBe(4);
});
