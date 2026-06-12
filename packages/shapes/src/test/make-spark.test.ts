import {expect, test} from 'bun:test';
import {makeSpark} from '../utils/make-spark';

test('Should be able to make a spark path', () => {
	const sparkPath = makeSpark({
		width: 400,
		height: 400,
		innerRadius: 50,
	});

	expect(sparkPath.width).toEqual(400);
	expect(sparkPath.height).toEqual(400);
	expect(sparkPath.transformOrigin).toEqual('200 200');
	expect(sparkPath.instructions.length).toEqual(10);
	expect(sparkPath.instructions[0]).toEqual({type: 'M', x: 200, y: 0});
	expect(sparkPath.instructions[9]).toEqual({type: 'Z'});
	expect(sparkPath.path.startsWith('M 200 0 L 235.35533905932738')).toBe(true);
});

test('Should be able to round spark tips and valleys', () => {
	const sparkPath = makeSpark({
		width: 160,
		height: 240,
		innerRadius: 28,
		tipRoundness: 12,
		valleyRoundness: 8,
		edgeRoundness: 0.3,
	});

	expect(sparkPath.instructions.length).toEqual(18);
	expect(
		sparkPath.path.startsWith('M 76.62647141895347 5.886193226528728'),
	).toBe(true);
});
