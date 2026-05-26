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

	expect(
		new Set([
			defaultStarburst.effectKey,
			moreRays.effectKey,
			rotated.effectKey,
			smoother.effectKey,
		]).size,
	).toBe(4);
});
