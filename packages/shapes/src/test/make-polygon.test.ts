import {expect, test} from 'vitest';
import {makePolygon} from '../utils/make-polygon';

test('Should be able to make a triangle path', () => {
	const polygonPath = makePolygon({
		points: 3,
		radius: 100,
	});

	expect(polygonPath).toEqual({
		path: 'M 100 0 L 186.60254037844388 150 L 13.397459621556152 150.00000000000003 L 100 0',
		width: 200,
		height: 200,
		transformOrigin: '100 100',
		instructions: [
			{type: 'M', x: 100, y: 0},
			{type: 'L', x: 186.60254037844388, y: 150},
			{type: 'L', x: 13.397459621556152, y: 150.00000000000003},
			{type: 'L', x: 100, y: 0},
		],
	});
});

test('Should be able to make a pentagon path', () => {
	const polygonPath = makePolygon({
		points: 5,
		radius: 100,
	});

	expect(polygonPath).toEqual({
		path: 'M 100 0 L 195.10565162951536 69.09830056250526 L 158.77852522924732 180.90169943749476 L 41.2214747707527 180.90169943749476 L 4.894348370484636 69.09830056250527 L 100 0',
		width: 200,
		height: 200,
		transformOrigin: '100 100',
		instructions: [
			{type: 'M', x: 100, y: 0},
			{type: 'L', x: 195.10565162951536, y: 69.09830056250526},
			{type: 'L', x: 158.77852522924732, y: 180.90169943749476},
			{type: 'L', x: 41.2214747707527, y: 180.90169943749476},
			{type: 'L', x: 4.894348370484636, y: 69.09830056250527},
			{type: 'L', x: 100, y: 0},
		],
	});
});

test('Should be able to make a hexagon path', () => {
	const polygonPath = makePolygon({
		points: 6,
		radius: 100,
	});

	expect(polygonPath).toEqual({
		path: 'M 100 0 L 186.60254037844385 50 L 186.60254037844388 150 L 100 200 L 13.397459621556152 150.00000000000003 L 13.397459621556095 50.000000000000064 L 100 0',
		width: 200,
		height: 200,
		transformOrigin: '100 100',
		instructions: [
			{type: 'M', x: 100, y: 0},
			{type: 'L', x: 186.60254037844385, y: 50},
			{type: 'L', x: 186.60254037844388, y: 150},
			{type: 'L', x: 100, y: 200},
			{type: 'L', x: 13.397459621556152, y: 150.00000000000003},
			{type: 'L', x: 13.397459621556095, y: 50.000000000000064},
			{type: 'L', x: 100, y: 0},
		],
	});
});
