import {expect, test} from 'vitest';
import {parseFilterOutsets} from '../drawing/filter-outsets';

test.each([
	'blue',
	'rgb(0, 0, 255)',
	'rgba(0, 0, 255, 0.5)',
	'hsl(240 100% 50%)',
	'color(srgb 0 0 1)',
	'color(display-p3 0 0 0)',
	'oklab(0 0 0)',
	'lab(0% 0 0)',
	'lch(0 0 0)',
	'oklch(0 0 0)',
	'#0000ff',
])('does not interpret %s color channels as shadow lengths', (color) => {
	expect(parseFilterOutsets(`drop-shadow(${color} 150px 0px 0px)`)).toEqual({
		left: 0,
		right: 150,
		top: 0,
		bottom: 0,
	});
});

test('preserves signed fractional offsets and blur with a trailing modern color', () => {
	expect(
		parseFilterOutsets('drop-shadow(-10.5px 20.5px 3px color(srgb 0 0 1))'),
	).toEqual({left: 19.5, right: 0, top: 0, bottom: 29.5});
});

test('accumulates combined filters without counting alpha channels', () => {
	expect(
		parseFilterOutsets(
			'drop-shadow(rgba(0, 0, 255, 0.5) -10px 20px 3px) blur(2px)',
		),
	).toEqual({left: 25, right: 6, top: 6, bottom: 35});
});

test('retains scientific-notation length tokens', () => {
	expect(parseFilterOutsets('drop-shadow(1e2px 0 0 blue)')).toEqual({
		left: 0,
		right: 100,
		top: 0,
		bottom: 0,
	});
});
