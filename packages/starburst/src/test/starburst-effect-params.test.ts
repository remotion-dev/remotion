import {expect, test} from 'bun:test';
import {starburst} from '../starburst-effect.js';

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
