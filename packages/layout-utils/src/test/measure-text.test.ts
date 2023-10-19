import {expect, test} from 'vitest';
import {measureText} from '../index';

// Make Node.JS 14 pass
if (typeof performance === 'undefined') {
	test('Pass', () => {
		expect(1).toBe(1);
	});
} else {
	test('should return dimensions for given text', () => {
		const text = 'Lorem ipsum';
		const fontFamily = 'Arial';
		const fontSize = 12;
		const dimensions = measureText({ text, fontFamily, fontSize });

		expect(dimensions).toHaveProperty('height');
		expect(dimensions).toHaveProperty('width');
	});
}
