import {expect, test} from 'bun:test';
import {blurSlide} from '../presentations/blur-slide';

test('blurSlide() should return a presentation', () => {
	const presentation = blurSlide({direction: 'from-top', blur: 0.3});

	expect(presentation.props).toEqual({direction: 'from-top', blur: 0.3});
	expect(typeof presentation.component).toBe('function');
});

test('blurSlide() should accept being called without arguments', () => {
	const presentation = blurSlide();

	expect(presentation.props).toEqual({});
	expect(typeof presentation.component).toBe('function');
});

test('blurSlide() should reject invalid props', () => {
	expect(() =>
		// @ts-expect-error invalid direction
		blurSlide({direction: 'from-center'}),
	).toThrow('direction');
	expect(() => blurSlide({blur: -0.1})).toThrow('blur');
	expect(() => blurSlide({blur: Number.NaN})).toThrow('finite');
	expect(() => blurSlide({blur: Number.POSITIVE_INFINITY})).toThrow('finite');
});
