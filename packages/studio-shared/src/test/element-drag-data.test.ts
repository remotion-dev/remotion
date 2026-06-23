import {expect, test} from 'bun:test';
import {makeElementDragData, parseElementDragData} from '../element-drag-data';

const validElement = {
	slug: 'overlays/lower-third',
	displayName: 'Lower Third',
	componentName: 'LowerThird',
	fileName: 'lower-third.element.tsx',
	sourceCode: 'export const LowerThird = () => null;',
	dimensions: {width: 900, height: 260},
	category: 'overlays',
};

test('parses element drag data', () => {
	expect(
		parseElementDragData(JSON.stringify(makeElementDragData(validElement))),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: validElement,
	});
});

test('parses element drag data without optional category', () => {
	expect(
		parseElementDragData(
			JSON.stringify(
				makeElementDragData({
					slug: 'lower-third',
					displayName: 'Lower Third',
					componentName: 'LowerThird',
					fileName: 'lower-third.element.tsx',
					sourceCode: 'export const LowerThird = () => null;',
					dimensions: {width: 900, height: 260},
				}),
			),
		),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: {
			slug: 'lower-third',
			displayName: 'Lower Third',
			componentName: 'LowerThird',
			fileName: 'lower-third.element.tsx',
			sourceCode: 'export const LowerThird = () => null;',
			dimensions: {width: 900, height: 260},
		},
	});
});

test('rejects invalid element drag data', () => {
	expect(parseElementDragData('')).toBe(null);
	expect(parseElementDragData('{')).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 2,
				element: validElement,
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-component',
				version: 1,
				element: validElement,
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, componentName: 'lowerThird'},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, fileName: 'LowerThird.element.tsx'},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, fileName: '../lower-third.element.tsx'},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, sourceCode: ''},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, dimensions: undefined},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, dimensions: {width: 0, height: 260}},
			}),
		),
	).toBe(null);
});
