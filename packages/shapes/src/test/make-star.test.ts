import {expect, test} from 'bun:test';
import {parsePath, serializeInstructions} from '@remotion/paths';
import {makeStar} from '../utils/make-star';

test('Should be able to make a star path', () => {
	const starPath = makeStar({
		points: 5,
		innerRadius: 150,
		outerRadius: 200,
	});

	expect(starPath.width).toEqual(380.42260651806146);
	expect(starPath.height).toEqual(361.8033988749895);
	expect(starPath.transformOrigin).toEqual('190.21130325903073 200');
	expect(starPath.instructions.length).toEqual(12);
	expect(starPath.instructions[0]).toEqual({
		type: 'M',
		x: 190.21130325903073,
		y: 0,
	});
	expect(starPath.instructions[11]).toEqual({type: 'Z'});
	expect(
		starPath.path.startsWith('M 190.21130325903073 0 L 278.3790911029017 78.'),
	).toBeTruthy();
});

test('transformOrigin and instructions match the returned path', () => {
	const {path, instructions, transformOrigin} = makeStar({
		points: 5,
		innerRadius: 150,
		outerRadius: 200,
	});
	const [originX, originY] = transformOrigin.split(' ').map(Number);

	for (const instruction of parsePath(path)) {
		if (instruction.type === 'M' || instruction.type === 'L') {
			const distance = Math.hypot(
				instruction.x - originX,
				instruction.y - originY,
			);
			expect(
				Math.min(Math.abs(distance - 150), Math.abs(distance - 200)),
			).toBeCloseTo(0);
		}
	}

	expect(serializeInstructions(instructions)).toBe(path);
});
