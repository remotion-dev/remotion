import {expect, test} from 'bun:test';
import {
	DEFAULT_BORDER,
	parseBorder,
	serializeBorder,
} from '../components/Timeline/timeline-border-utils';

test('parseBorder parses width, style and rgba color', () => {
	expect(parseBorder('1px solid rgba(24, 24, 27, 0.08)')).toEqual({
		width: 1,
		widthUnit: 'px',
		style: 'solid',
		color: 'rgba(24, 24, 27, 0.08)',
	});
});

test('parseBorder handles hex color and non-px unit', () => {
	expect(parseBorder('2.5rem dashed #ff0000')).toEqual({
		width: 2.5,
		widthUnit: 'rem',
		style: 'dashed',
		color: '#ff0000',
	});
});

test('parseBorder resolves line-width keywords to pixel widths', () => {
	expect(parseBorder('thin solid black')).toEqual({
		width: 1,
		widthUnit: 'px',
		style: 'solid',
		color: 'black',
	});
	expect(parseBorder('medium dashed red')).toEqual({
		width: 3,
		widthUnit: 'px',
		style: 'dashed',
		color: 'red',
	});
	expect(parseBorder('thick solid #fff').width).toBe(5);
});

test('parseBorder falls back to defaults for non-strings', () => {
	expect(parseBorder(undefined)).toEqual(DEFAULT_BORDER);
	expect(parseBorder(42)).toEqual(DEFAULT_BORDER);
});

test('parseBorder keeps a unitless width', () => {
	expect(parseBorder('0 solid black')).toEqual({
		width: 0,
		widthUnit: 'px',
		style: 'solid',
		color: 'black',
	});
});

test('serializeBorder round-trips a parsed border', () => {
	const value = '1px solid rgba(24, 24, 27, 0.08)';
	expect(serializeBorder(parseBorder(value))).toBe(value);
});

test('serializeBorder normalizes floating point noise', () => {
	expect(
		serializeBorder({
			width: 0.1 + 0.2,
			widthUnit: 'px',
			style: 'solid',
			color: '#000000',
		}),
	).toBe('0.3px solid #000000');
});
