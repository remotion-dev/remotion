import {expect, test} from 'bun:test';
import {blur} from '../blur/index.js';
import {brightness} from '../brightness.js';
import {grayscale} from '../grayscale.js';
import {hue} from '../hue.js';
import {invert} from '../invert.js';
import {scale} from '../scale.js';
import {tint} from '../tint.js';
import {wave} from '../wave/index.js';

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

test('wave() accepts default params', () => {
	expect(() => wave()).not.toThrow();
});

test('wave() rejects invalid direction', () => {
	expect(() => wave({direction: 'diagonal' as 'horizontal'})).toThrow(
		'"direction" must be "horizontal" or "vertical"',
	);
});

test('wave() rejects non-positive wavelength', () => {
	expect(() => wave({wavelength: 0})).toThrow('"wavelength" must be > 0');
});

test('wave() rejects negative amplitude', () => {
	expect(() => wave({amplitude: -1})).toThrow('"amplitude" must be >= 0');
});

test('wave() direction produces distinct effect keys', () => {
	const horizontal = wave({direction: 'horizontal'});
	const vertical = wave({direction: 'vertical'});
	expect(horizontal.effectKey).not.toBe(vertical.effectKey);
});

test('grayscale() accepts default params', () => {
	expect(() => grayscale()).not.toThrow();
});

test('grayscale() rejects non-finite amount', () => {
	expect(() => grayscale({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('grayscale() rejects amount below range', () => {
	expect(() => grayscale({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('grayscale() rejects amount above range', () => {
	expect(() => grayscale({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('grayscale() amount produces distinct effect keys', () => {
	const none = grayscale({amount: 0});
	const full = grayscale({amount: 1});
	expect(none.effectKey).not.toBe(full.effectKey);
});

test('brightness() accepts default params', () => {
	expect(() => brightness()).not.toThrow();
});

test('brightness() rejects non-finite amount', () => {
	expect(() => brightness({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('brightness() rejects amount below range', () => {
	expect(() => brightness({amount: -1.1})).toThrow('"amount" must be >= -1');
});

test('brightness() rejects amount above range', () => {
	expect(() => brightness({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('brightness() amount produces distinct effect keys', () => {
	const darker = brightness({amount: -0.4});
	const neutral = brightness({amount: 0});
	const brighter = brightness({amount: 0.4});
	expect(
		new Set([darker.effectKey, neutral.effectKey, brighter.effectKey]).size,
	).toBe(3);
});

test('invert() accepts default params', () => {
	expect(() => invert()).not.toThrow();
});

test('invert() rejects non-finite amount', () => {
	expect(() => invert({amount: Number.NaN})).toThrow(
		'"amount" must be a finite number',
	);
});

test('invert() rejects amount below range', () => {
	expect(() => invert({amount: -0.1})).toThrow('"amount" must be >= 0');
});

test('invert() rejects amount above range', () => {
	expect(() => invert({amount: 1.1})).toThrow('"amount" must be <= 1');
});

test('invert() amount produces distinct effect keys', () => {
	const none = invert({amount: 0});
	const full = invert({amount: 1});
	expect(none.effectKey).not.toBe(full.effectKey);
});

test('hue() accepts default params', () => {
	expect(() => hue()).not.toThrow();
});

test('hue() rejects non-finite degrees', () => {
	expect(() => hue({degrees: Number.NaN})).toThrow(
		'"degrees" must be a finite number',
	);
});

test('hue() degrees produces distinct effect keys', () => {
	const noRotation = hue({degrees: 0});
	const rotated = hue({degrees: 90});
	expect(noRotation.effectKey).not.toBe(rotated.effectKey);
});

test('scale() throws when scale is not passed', () => {
	expect(() => scale({} as Parameters<typeof scale>[0])).toThrow(
		'"scale" must be a finite number, but got undefined',
	);
});

test('scale() accepts valid params', () => {
	expect(() => scale({scale: 1.5})).not.toThrow();
});

test('scale() accepts horizontal-only scaling', () => {
	expect(() =>
		scale({scale: 1.5, horizontal: true, vertical: false}),
	).not.toThrow();
});

test('scale() accepts vertical-only scaling', () => {
	expect(() =>
		scale({scale: 1.5, horizontal: false, vertical: true}),
	).not.toThrow();
});

test('scale() accepts both axes disabled', () => {
	expect(() =>
		scale({scale: 1.5, horizontal: false, vertical: false}),
	).not.toThrow();
});

test('scale() rejects non-positive scale', () => {
	expect(() => scale({scale: 0})).toThrow('"scale" must be greater than 0');
});

test('scale() axis flags produce distinct effect keys', () => {
	const both = scale({scale: 1.5});
	const horizontalOnly = scale({scale: 1.5, vertical: false});
	const verticalOnly = scale({scale: 1.5, horizontal: false});
	const neither = scale({scale: 1.5, horizontal: false, vertical: false});

	const keys = [
		both.effectKey,
		horizontalOnly.effectKey,
		verticalOnly.effectKey,
		neither.effectKey,
	];
	expect(new Set(keys).size).toBe(keys.length);
});
