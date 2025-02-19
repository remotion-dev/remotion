import {expect, test} from 'bun:test';
import {translatePath} from '../translate-path';

test('Should be able to translate simple path, update x', () => {
	const path = translatePath('M10 10 L15 15', 10, 0);

	expect(path).toEqual('M 20 10 L 25 15');
});

test('Should be able to translate simple path, update x and y', () => {
	const path = translatePath('M10 10 L15 15', 10, 10);

	expect(path).toEqual('M 20 20 L 25 25');
});

test('Should be able to translate circle path, update x', () => {
	const path = translatePath(
		'M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0',
		10,
		0,
	);

	expect(path).toEqual('M 45 50 a 25 25 0 1 1 50 0 a 25 25 0 1 1 -50 0');
});

test('Should be able to translate circle path, update x and y', () => {
	const path = translatePath(
		'M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0',
		10,
		20,
	);

	expect(path).toEqual('M 45 70 a 25 25 0 1 1 50 0 a 25 25 0 1 1 -50 0');
});

test('Should be able to translate example path, update x', () => {
	const path = translatePath('M 50 50 L 150 50', 10, 0);

	expect(path).toEqual('M 60 50 L 160 50');
});

test('Translation should throw error', () => {
	expect(() => {
		translatePath('remotion', 10, 0);
	}).toThrow('Malformed path data: m was expected to have numbers afterwards');
});
