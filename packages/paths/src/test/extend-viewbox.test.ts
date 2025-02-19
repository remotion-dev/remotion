import {expect, test} from 'bun:test';
import {extendViewBox} from '../extend-viewbox';

test('Should be able to extend a viewBox', () => {
	expect(extendViewBox('0 0 1000 1000', 2)).toEqual('-500 -500 2000 2000');
});

test('Should reject an invalid viewBox', () => {
	expect(() => extendViewBox('0 0 1000 ', 2)).toThrow(
		/currentViewBox must be 4 valid numbers, but got "0 0 1000 "/,
	);
});
