import {expect, test} from 'bun:test';
import {colorToRgb} from '../color-to-rgb.js';
import {starburst, StarburstInternals} from '../index.js';
import {starburstSchema} from '../Starburst.js';

test('colorToRgb() parses CSS colors using Remotion color parsing', () => {
	expect(colorToRgb('red')).toEqual([255, 0, 0]);
	expect(colorToRgb('hsl(120, 100%, 50%)')).toEqual([0, 255, 0]);
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

test('@remotion/starburst re-exports the migrated effect', () => {
	expect(StarburstInternals.starburst).toBe(starburst);
	expect(
		starburst({rays: 12, colors: ['#ff0000', '#00ff00']}).definition
			.documentationLink,
	).toBe('https://www.remotion.dev/docs/effects/starburst');
});
