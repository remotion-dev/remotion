import {expect, test} from 'bun:test';
import {colorToRgb} from '../color-to-rgb.js';
import {starburst} from '../starburst-effect.js';
import {starburstSchema} from '../Starburst.js';

test('starburst() throws when rays is not passed', () => {
	expect(() =>
		starburst({
			colors: ['#ff0000', '#00ff00'],
		} as unknown as Parameters<typeof starburst>[0]),
	).toThrow('"rays" must be a finite number, but got undefined');
});

test('starburst() accepts valid params', () => {
	expect(() =>
		starburst({rays: 12, colors: ['#ff0000', '#00ff00']}),
	).not.toThrow();
});

test('starburst() accepts CSS named colors', () => {
	expect(() => starburst({rays: 12, colors: ['red', 'blue']})).not.toThrow();
});

test('colorToRgb() parses CSS colors using Remotion color parsing', () => {
	expect(colorToRgb('red')).toEqual([255, 0, 0]);
	expect(colorToRgb('hsl(120, 100%, 50%)')).toEqual([0, 255, 0]);
});

test('starburst() exposes its documentation link', () => {
	expect(
		starburst({rays: 12, colors: ['#ff0000', '#00ff00']}).definition
			.documentationLink,
	).toBe('https://www.remotion.dev/docs/starburst/starburst-effect');
});

test('starburst() exposes its API name as the Studio label', () => {
	expect(
		starburst({rays: 12, colors: ['#ff0000', '#00ff00']}).definition.label,
	).toBe('starburst()');
});

test('starburst() does not expose the removed vignette control', () => {
	expect(
		'vignette' in
			starburst({rays: 12, colors: ['#ff0000', '#00ff00']}).definition.schema,
	).toBe(false);
});

test('starburst() exposes origin as a UV coordinate control', () => {
	const {schema} = starburst({
		rays: 12,
		colors: ['#ff0000', '#00ff00'],
	}).definition;

	expect('originOffsetX' in schema).toBe(false);
	expect('originOffsetY' in schema).toBe(false);
	expect(schema.origin).toEqual({
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: [0.5, 0.5],
		description: 'Origin',
	});
});

test('starburst() exposes colors as an array control', () => {
	const {schema} = starburst({
		rays: 12,
		colors: ['#ff0000', '#00ff00'],
	}).definition;

	expect(schema.colors).toEqual({
		type: 'array',
		item: {
			type: 'color',
		},
		default: undefined,
		minLength: 2,
		newItemDefault: '#ff0000',
		description: 'Colors',
		keyframable: false,
	});
});

test('<Starburst> exposes colors as an array control', () => {
	expect(starburstSchema.colors).toEqual({
		type: 'array',
		item: {
			type: 'color',
		},
		default: undefined,
		minLength: 2,
		newItemDefault: '#ff0000',
		description: 'Colors',
		keyframable: false,
	});
});

test('<Starburst> exposes background and border controls', () => {
	expect('style.backgroundColor' in starburstSchema).toBe(true);
	expect('style.borderWidth' in starburstSchema).toBe(true);
	expect('style.borderStyle' in starburstSchema).toBe(true);
	expect('style.borderColor' in starburstSchema).toBe(true);
});

test('starburst() parameters produce distinct effect keys', () => {
	const defaultStarburst = starburst({
		rays: 12,
		colors: ['#ff0000', '#00ff00'],
	});
	const moreRays = starburst({
		rays: 24,
		colors: ['#ff0000', '#00ff00'],
	});
	const rotated = starburst({
		rays: 12,
		colors: ['#ff0000', '#00ff00'],
		rotation: 45,
	});
	const smoother = starburst({
		rays: 12,
		colors: ['#ff0000', '#00ff00'],
		smoothness: 0.5,
	});
	const shiftedOrigin = starburst({
		rays: 12,
		colors: ['#ff0000', '#00ff00'],
		origin: [0.25, 0.75],
	});

	expect(
		new Set([
			defaultStarburst.effectKey,
			moreRays.effectKey,
			rotated.effectKey,
			smoother.effectKey,
			shiftedOrigin.effectKey,
		]).size,
	).toBe(5);
});

test('starburst() defaults origin to the center UV coordinate', () => {
	expect(starburst({rays: 12, colors: ['#ff0000', '#00ff00']}).effectKey).toBe(
		starburst({
			rays: 12,
			colors: ['#ff0000', '#00ff00'],
			origin: [0.5, 0.5],
		}).effectKey,
	);
});

test('starburst() validates origin as a UV coordinate', () => {
	expect(() =>
		starburst({
			rays: 12,
			colors: ['#ff0000', '#00ff00'],
			origin: [0.5, Number.NaN],
		}),
	).toThrow('"origin" must be a [number, number] tuple');

	expect(() =>
		starburst({
			rays: 12,
			colors: ['#ff0000', '#00ff00'],
			origin: [1.1, 0.5],
		}),
	).toThrow('"origin" must contain coordinates between 0 and 1');
});
