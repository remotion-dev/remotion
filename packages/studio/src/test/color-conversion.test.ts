import {expect, test} from 'bun:test';
import {parseEyeDropperColor} from '../components/ColorPicker/ColorPickerPopup';
import {
	formatRgba,
	hsvToRgb,
	parseAnyColor,
	rgbToHsv,
} from '../helpers/color-conversion';

test('parseAnyColor accepts hex', () => {
	expect(parseAnyColor('#ff0000')).toEqual({r: 255, g: 0, b: 0, a: 255});
});

test('parseAnyColor accepts rgba', () => {
	expect(parseAnyColor('rgba(255, 255, 255, 0.5)')).toEqual({
		r: 255,
		g: 255,
		b: 255,
		a: 128,
	});
});

test('parseAnyColor accepts named colors', () => {
	expect(parseAnyColor('red')).toEqual({r: 255, g: 0, b: 0, a: 255});
});

test('parseAnyColor falls back on garbage', () => {
	expect(parseAnyColor('not a color')).toEqual({r: 0, g: 0, b: 0, a: 255});
});

test('formatRgba returns hex when fully opaque', () => {
	expect(formatRgba({r: 255, g: 0, b: 0, a: 255})).toBe('#ff0000');
});

test('formatRgba returns rgba when transparent', () => {
	expect(formatRgba({r: 255, g: 0, b: 0, a: 128})).toBe('rgba(255, 0, 0, 0.5)');
});

test('parseEyeDropperColor always returns a fully opaque color', () => {
	expect(parseEyeDropperColor('#ff000080')).toEqual({
		r: 255,
		g: 0,
		b: 0,
		a: 255,
	});
});

test('rgbToHsv / hsvToRgb roundtrip primaries', () => {
	const reds = rgbToHsv({r: 255, g: 0, b: 0});
	expect(Math.round(reds.h)).toBe(0);
	expect(reds.s).toBe(1);
	expect(reds.v).toBe(1);

	const back = hsvToRgb({h: reds.h, s: reds.s, v: reds.v});
	expect(back).toEqual({r: 255, g: 0, b: 0});
});

test('rgbToHsv / hsvToRgb roundtrip greens', () => {
	const green = rgbToHsv({r: 0, g: 255, b: 0});
	expect(Math.round(green.h)).toBe(120);
	const back = hsvToRgb({h: green.h, s: green.s, v: green.v});
	expect(back).toEqual({r: 0, g: 255, b: 0});
});
