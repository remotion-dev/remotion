import {expect, test} from 'bun:test';
import {validateEvenDimensionsWithCodec} from '../validate-even-dimensions-with-codec';

test('should eventually result in even dimensions', () => {
	const scale = 2.3275862069;
	const {actualWidth, actualHeight} = validateEvenDimensionsWithCodec({
		codec: 'h264',
		width: 464,
		height: 832,
		indent: false,
		logLevel: 'info',
		scale,
		wantsImageSequence: false,
	});
	expect(actualHeight).toBe(831);
	expect(actualWidth).toBe(464);
	expect(Math.round(actualHeight * scale)).toBe(1934);
	expect(Math.round(actualWidth * scale)).toBe(1080);
});

test('default case', () => {
	const scale = 2;
	const {actualWidth, actualHeight} = validateEvenDimensionsWithCodec({
		codec: 'h264',
		width: 464,
		height: 832,
		indent: false,
		logLevel: 'info',
		scale,
		wantsImageSequence: false,
	});
	expect(actualHeight).toBe(832);
	expect(actualWidth).toBe(464);
	expect(Math.round(actualHeight * scale)).toBe(1664);
	expect(Math.round(actualWidth * scale)).toBe(928);
});
