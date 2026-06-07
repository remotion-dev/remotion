import {expect, test} from 'bun:test';
import {makeShapeDragData, parseShapeDragData} from '../shape-drag-data';

test('parses shape drag data', () => {
	expect(
		parseShapeDragData(
			JSON.stringify(
				makeShapeDragData({
					attributes: [
						{name: 'radius', value: 100},
						{name: 'fill', value: '#0b84ff'},
					],
					shape: 'Circle',
				}),
			),
		),
	).toEqual({
		type: 'remotion-shape',
		version: 1,
		shape: 'Circle',
		attributes: [
			{name: 'radius', value: 100},
			{name: 'fill', value: '#0b84ff'},
		],
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
				attributes: [],
			}),
		),
	).toBe(null);
	expect(
		parseShapeDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 1,
				shape: 'NotAShape',
				attributes: [],
			}),
		),
	).toBe(null);
	expect(
		parseShapeDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 1,
				shape: 'Circle',
			}),
		),
	).toBe(null);
	expect(
		parseShapeDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 1,
				shape: 'Circle',
				attributes: [{name: 'style', value: 'position: absolute'}],
			}),
		),
	).toBe(null);
	expect(
		parseShapeDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 1,
				shape: 'Circle',
				attributes: [
					{name: 'radius', value: 100},
					{name: 'radius', value: 200},
				],
			}),
		),
	).toBe(null);
});
