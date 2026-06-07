import {expect, test} from 'bun:test';
import {makeShapeDragData, parseShapeDragData} from '../shape-drag-data';

test('parses shape drag data', () => {
	expect(
		parseShapeDragData(JSON.stringify(makeShapeDragData('Circle'))),
	).toEqual({
		type: 'remotion-shape',
		version: 1,
		shape: 'Circle',
	});
});

test('rejects invalid shape drag data', () => {
	expect(parseShapeDragData('')).toBe(null);
	expect(parseShapeDragData('{')).toBe(null);
	expect(
		parseShapeDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 2,
				shape: 'Circle',
			}),
		),
	).toBe(null);
	expect(
		parseShapeDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 1,
				shape: 'NotAShape',
			}),
		),
	).toBe(null);
});
