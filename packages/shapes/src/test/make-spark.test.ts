import {expect, test} from 'bun:test';
import {makeSpark} from '../utils/make-spark';

test('Should be able to make a spark path', () => {
	const sparkPath = makeSpark({
		innerRadius: 50,
		outerRadius: 200,
	});

	expect(sparkPath.width).toEqual(400);
	expect(sparkPath.height).toEqual(400);
	expect(sparkPath.transformOrigin).toEqual('200 200');
	expect(sparkPath.instructions.length).toEqual(10);
	expect(sparkPath.instructions[0]).toEqual({type: 'M', x: 200, y: 0});
	expect(sparkPath.instructions[9]).toEqual({type: 'Z'});
	expect(sparkPath.path.startsWith('M 200 0 L 235.35533905932738')).toBe(true);
});
