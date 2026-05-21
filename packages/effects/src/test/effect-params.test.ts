import {expect, test} from 'bun:test';
import {blur} from '../blur/index.js';
import {tint} from '../tint.js';

test('tint() throws when color is not passed', () => {
	expect(() => tint({} as Parameters<typeof tint>[0])).toThrow(
		'"color" must be a non-empty string, but got undefined',
	);
});

test('tint() accepts valid params', () => {
	expect(() => tint({color: '#ff0000'})).not.toThrow();
});

test('blur() throws when radius is not passed', () => {
	expect(() => blur({} as Parameters<typeof blur>[0])).toThrow(
		'"radius" must be a finite number, but got undefined',
	);
});

test('blur() accepts valid params', () => {
	expect(() => blur({radius: 4})).not.toThrow();
});

test('blur() accepts horizontal-only blur', () => {
	expect(() =>
		blur({radius: 4, horizontal: true, vertical: false}),
	).not.toThrow();
});

test('blur() accepts vertical-only blur', () => {
	expect(() =>
		blur({radius: 4, horizontal: false, vertical: true}),
	).not.toThrow();
});

test('blur() accepts both axes disabled', () => {
	expect(() =>
		blur({radius: 4, horizontal: false, vertical: false}),
	).not.toThrow();
});

test('blur() axis flags produce distinct effect keys', () => {
	const both = blur({radius: 4});
	const horizontalOnly = blur({radius: 4, vertical: false});
	const verticalOnly = blur({radius: 4, horizontal: false});
	const neither = blur({radius: 4, horizontal: false, vertical: false});

	const keys = [
		both.effectKey,
		horizontalOnly.effectKey,
		verticalOnly.effectKey,
		neither.effectKey,
	];
	expect(new Set(keys).size).toBe(keys.length);
});
