import {expect, test} from 'bun:test';
import {reversePath} from '../reverse-path';

test('Should be able to reverse a path', () => {
	const reversedPath = reversePath(`
  M 0 0 L 100 0
  `);
	expect(reversedPath).toEqual('M 100 0 L 0 0');
});

test('Should not crash out', () => {
	expect(
		reversePath(
			'M949 508V406.455C949 379.142 971.142 357 998.455 357V357C1025.77 357 1047.91 379.142 1047.91 406.455V508',
		),
	).toEqual(
		'M 1047.91 508 L 1047.91 406.455 C 1047.91 379.142 1025.77 357 998.455 357 L 998.455 357 C 971.142 357 949 379.142 949 406.455 L 949 508',
	);
});

test('Should be able to reverse a path with 2 M statements', () => {
	const reversedPath = reversePath(`
  M 0 0 L 100 0
  M 0 0 L 200 100
	`);
	expect(reversedPath).toEqual('M 100 0 L 0 0 M 200 100 L 0 0');
});

test('Should be able to reverse a path with Z', () => {
	const reversedPath = reversePath(`
  M 0 0 L 100 0
  M 0 0 L 200 100 Z
	`);
	expect(reversedPath).toEqual('M 100 0 L 0 0 M 200 100 L 0 0Z');
});
