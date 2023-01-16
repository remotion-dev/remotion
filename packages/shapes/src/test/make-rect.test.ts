import {expect, test} from 'vitest';
import {makeRect} from '../make-rect';

test('Should be able to make a rect path', () => {
	const rect = makeRect({width: 100, height: 100});
	expect(rect).toEqual('M 50 50 l 100 0 l 0 100 l -100 0 Z');
});
