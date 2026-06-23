import {expect, test} from 'bun:test';
import {
	makeElementDragData,
	makeElementFileNameFromSlug,
	parseElementDragData,
} from '../element-drag-data';

const validElement = {
	slug: 'overlays/lower-third',
	displayName: 'Lower Third',
	componentName: 'LowerThird',
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
			sourceCode: 'export const LowerThird = () => null;',
			dimensions: {width: 900, height: 260},
		},
	});
});

test('derives element file name from slug', () => {
	expect(makeElementFileNameFromSlug('overlays/lower-third')).toBe(
		'lower-third.element.tsx',
	);
	expect(makeElementFileNameFromSlug('LowerThird')).toBe(null);
	expect(makeElementFileNameFromSlug('overlays/../lower-third')).toBe(null);
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
				element: {...validElement, slug: 'LowerThird'},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, slug: '../lower-third'},
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
