import {expect, test} from 'bun:test';
import {makeArrow} from '../utils/make-arrow';

test('Should be able to make a right-pointing arrow path', () => {
	const arrow = makeArrow({
		length: 200,
		headWidth: 80,
		headLength: 80,
		shaftWidth: 40,
	});

	expect(arrow).toEqual({
		width: 200,
		height: 80,
		path: 'M 0 20 L 120 20 L 120 0 L 200 40 L 120 80 L 120 60 L 0 60 Z',
		transformOrigin: '100 40',
		instructions: [
			{type: 'M', x: 0, y: 20},
			{type: 'L', x: 120, y: 20},
			{type: 'L', x: 120, y: 0},
			{type: 'L', x: 200, y: 40},
			{type: 'L', x: 120, y: 80},
			{type: 'L', x: 120, y: 60},
			{type: 'L', x: 0, y: 60},
			{type: 'Z'},
		],
	});
});

test('Should be able to make a left-pointing arrow path', () => {
	const arrow = makeArrow({
		length: 200,
		headWidth: 80,
		headLength: 80,
		shaftWidth: 40,
		direction: 'left',
	});

	expect(arrow.width).toEqual(200);
	expect(arrow.height).toEqual(80);
	expect(arrow.transformOrigin).toEqual('100 40');
	expect(arrow.path).toEqual(
		'M 200 20 L 80 20 L 80 0 L 0 40 L 80 80 L 80 60 L 200 60 Z',
	);
});

test('Should be able to make an upward-pointing arrow path', () => {
	const arrow = makeArrow({
		length: 200,
		headWidth: 80,
		headLength: 80,
		shaftWidth: 40,
		direction: 'up',
	});

	expect(arrow.width).toEqual(80);
	expect(arrow.height).toEqual(200);
	expect(arrow.transformOrigin).toEqual('40 100');
	expect(arrow.path).toEqual(
		'M 20 200 L 60 200 L 60 80 L 80 80 L 40 0 L 0 80 L 20 80 Z',
	);
});

test('Should be able to make a downward-pointing arrow path', () => {
	const arrow = makeArrow({
		length: 200,
		headWidth: 80,
		headLength: 80,
		shaftWidth: 40,
		direction: 'down',
	});

	expect(arrow.width).toEqual(80);
	expect(arrow.height).toEqual(200);
	expect(arrow.transformOrigin).toEqual('40 100');
	expect(arrow.path).toEqual(
		'M 20 0 L 60 0 L 60 120 L 80 120 L 40 200 L 0 120 L 20 120 Z',
	);
});

test('Should throw if headWidth < shaftWidth', () => {
	expect(() =>
		makeArrow({
			length: 200,
			headWidth: 30,
			headLength: 80,
			shaftWidth: 40,
		}),
	).toThrow('"headWidth" must be greater than or equal to "shaftWidth"');
});

test('Should throw if headLength > length', () => {
	expect(() =>
		makeArrow({
			length: 50,
			headWidth: 80,
			headLength: 80,
			shaftWidth: 40,
		}),
	).toThrow('"headLength" must be less than or equal to "length"');
});

test('Should throw if any dimension is non-positive', () => {
	expect(() =>
		makeArrow({
			length: 0,
			headWidth: 80,
			headLength: 80,
			shaftWidth: 40,
		}),
	).toThrow('must be positive numbers');

	expect(() =>
		makeArrow({
			length: 200,
			headWidth: 0,
			headLength: 80,
			shaftWidth: 40,
		}),
	).toThrow('must be positive numbers');

	expect(() =>
		makeArrow({
			length: 200,
			headWidth: 80,
			headLength: 0,
			shaftWidth: 40,
		}),
	).toThrow('must be positive numbers');

	expect(() =>
		makeArrow({
			length: 200,
			headWidth: 80,
			headLength: 80,
			shaftWidth: 0,
		}),
	).toThrow('must be positive numbers');
});

test('Should be able to make an arrow with cornerRadius', () => {
	const arrow = makeArrow({
		length: 200,
		headWidth: 80,
		headLength: 80,
		shaftWidth: 40,
		cornerRadius: 10,
	});

	expect(arrow.width).toEqual(200);
	expect(arrow.height).toEqual(80);
	expect(arrow.transformOrigin).toEqual('100 40');
	expect(arrow.path).toBeTruthy();
	expect(arrow.instructions).toEqual(expect.any(Array));
});
