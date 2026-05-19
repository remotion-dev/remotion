import {expect, test} from 'bun:test';
import {starburst} from '../starburst-effect.js';

test('starburst() throws when rays is not passed', () => {
	expect(() =>
		starburst({
			colors: ['#ff0000', '#00ff00'],
		} as unknown as Parameters<typeof starburst>[0]),
	).toThrow('"rays" must be a finite number, but got undefined');
});

test('starburst() accepts valid params', () => {
	expect(() =>
		starburst({rays: 12, colors: ['#ff0000', '#00ff00']}),
	).not.toThrow();
});
