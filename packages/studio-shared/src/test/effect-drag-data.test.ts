import {expect, test} from 'bun:test';
import {parseEffectDragData} from '../effect-drag-data';

test('parses effect drag data', () => {
	expect(
		parseEffectDragData(
			JSON.stringify({
				type: 'remotion-effect',
				version: 1,
				effect: {
					name: 'glow',
					importPath: '@remotion/effects',
					config: {
						intensity: 0.5,
					},
				},
			}),
		),
	).toEqual({
		type: 'remotion-effect',
		version: 1,
		effect: {
			name: 'glow',
			importPath: '@remotion/effects',
			config: {
				intensity: 0.5,
			},
		},
	});
});

test('rejects invalid effect drag data', () => {
	expect(parseEffectDragData('')).toBe(null);
	expect(parseEffectDragData('{')).toBe(null);
	expect(
		parseEffectDragData(
			JSON.stringify({
				type: 'remotion-effect',
				version: 2,
				effect: {
					name: 'glow',
					importPath: '@remotion/effects',
					config: {},
				},
			}),
		),
	).toBe(null);
	expect(
		parseEffectDragData(
			JSON.stringify({
				type: 'remotion-effect',
				version: 1,
				effect: {
					name: 'glow',
					importPath: '@remotion/effects',
					config: [],
				},
			}),
		),
	).toBe(null);
	expect(
		parseEffectDragData(
			JSON.stringify({
				type: 'remotion-effect',
				version: 1,
				effect: {
					name: 1,
					importPath: '@remotion/effects',
					config: {},
				},
			}),
		),
	).toBe(null);
});
