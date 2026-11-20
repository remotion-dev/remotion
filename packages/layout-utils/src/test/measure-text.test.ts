import {expect, test, vi} from 'vitest';
import {measureText} from '../layouts/measure-text';

test('measureText() does not reuse a measurement taken with another fontVariantNumeric', () => {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
		function (this: HTMLElement) {
			const width =
				this.style.fontVariantNumeric === 'tabular-nums' ? 556 : 489;
			return new DOMRect(0, 0, width, 115);
		},
	);

	const word = {text: '1111111111', fontFamily: 'Arial', fontSize: 100};

	expect(measureText(word).width).toBe(489);
	expect(measureText({...word, fontVariantNumeric: 'tabular-nums'}).width).toBe(
		556,
	);
});
