import {expect, test} from 'bun:test';
import {renderAnnotation} from '../render-annotation';

test('type none renders no annotation paths', () => {
	const result = renderAnnotation({
		rect: {x: 0, y: 0, w: 100, h: 40},
		config: {type: 'none'},
		seed: 1,
		progress: 1,
		options: {},
	});

	expect(result).toEqual([]);
});
