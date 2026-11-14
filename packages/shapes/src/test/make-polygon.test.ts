import {expect, test} from 'bun:test';
import {parsePath, serializeInstructions} from '@remotion/paths';
import {makePolygon} from '../utils/make-polygon';

test('Should be able to make a triangle path', () => {
	const polygonPath = makePolygon({
		points: 3,
		radius: 100,
	});

	expect(polygonPath).toEqual({
		path: 'M 86.60254037844385 0 L 173.20508075688772 150 L 0 150.00000000000003 L 86.60254037844385 0',
		width: 173.20508075688772,
		height: 150.00000000000003,
		transformOrigin: '86.60254037844385 100',
		instructions: [
			{type: 'M', x: 86.60254037844385, y: 0},
			{type: 'L', x: 173.20508075688772, y: 150},
			{type: 'L', x: 0, y: 150.00000000000003},
			{type: 'L', x: 86.60254037844385, y: 0},
		],
	});
});

test('Should be able to make a pentagon path', () => {
	const polygonPath = makePolygon({
		points: 5,
		radius: 100,
	});

	expect(polygonPath.width).toEqual(190.21130325903073);
	expect(polygonPath.height).toEqual(180.90169943749476);
	expect(polygonPath.transformOrigin).toEqual('95.10565162951536 100');
	expect(polygonPath.instructions.length).toEqual(6);
	expect(polygonPath.instructions[0]).toEqual({
		type: 'M',
		x: 95.10565162951536,
		y: 0,
	});
	expect(polygonPath.instructions[5]).toEqual({
		type: 'L',
		x: 95.10565162951536,
		y: 0,
	});
	expect(polygonPath.instructions[4]).toEqual({
		type: 'L',
		x: 0,
		y: 69.09830056250527,
	});
});

test('Should be able to make a hexagon path', () => {
	const polygonPath = makePolygon({
		points: 6,
		radius: 100,
	});

	expect(polygonPath).toEqual({
		path: 'M 86.6025403784439 0 L 173.20508075688775 50 L 173.20508075688778 150 L 86.6025403784439 200 L 5.684341886080802e-14 150.00000000000003 L 0 50.000000000000064 L 86.6025403784439 0',
		width: 173.20508075688778,
		height: 200,
		transformOrigin: '86.6025403784439 100',
		instructions: [
			{type: 'M', x: 86.6025403784439, y: 0},
			{type: 'L', x: 173.20508075688775, y: 50},
			{type: 'L', x: 173.20508075688778, y: 150},
			{type: 'L', x: 86.6025403784439, y: 200},
			{type: 'L', x: expect.closeTo(0, 10), y: 150.00000000000003},
			{type: 'L', x: 0, y: 50.000000000000064},
			{type: 'L', x: 86.6025403784439, y: 0},
		],
	});
});

test('transformOrigin and instructions match the returned path', () => {
	const {path, instructions, transformOrigin} = makePolygon({
		points: 5,
		radius: 100,
	});
	const [originX, originY] = transformOrigin.split(' ').map(Number);

	for (const instruction of parsePath(path)) {
		if (instruction.type === 'M' || instruction.type === 'L') {
			expect(
				Math.hypot(instruction.x - originX, instruction.y - originY),
			).toBeCloseTo(100);
		}
	}

	expect(serializeInstructions(instructions)).toBe(path);
});
