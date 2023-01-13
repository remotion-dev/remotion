import {expect, test} from 'vitest';
import {makeCircle} from '../make-circle';

test('Should be able to make a circle path', () => {
	const circlePath = makeCircle({cx: 50, cy: 50, radius: 50});
	expect(circlePath).toEqual(
		'M 50 50 m -50, 0 a 50,50 0 1,0 100,0  50,50 0 1,0 -100,0'
	);
});
