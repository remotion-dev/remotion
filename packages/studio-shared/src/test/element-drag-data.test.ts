import {expect, test} from 'bun:test';
import {
	makeElementDragData,
	makeElementFileNameFromSlug,
	parseElementDragData,
} from '@remotion/drag-and-drop';

const validElement = {
	dependencies: ['@remotion/google-fonts'],
	slug: 'overlays/lower-third',
	displayName: 'Lower Third',
	sourceCode: 'export const LowerThird = () => null;',
	dimensions: {width: 900, height: 260},
};

test('parses element drag data', () => {
	expect(
		parseElementDragData(JSON.stringify(makeElementDragData(validElement))),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: validElement,
		preview: {
			kind: 'element',
			width: 900,
			height: 260,
		},
	});
});

test('accepts older element drag data without dependencies', () => {
	const {dependencies: _dependencies, ...elementWithoutDependencies} =
		validElement;
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: elementWithoutDependencies,
			}),
		),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: {...elementWithoutDependencies, dependencies: []},
		preview: {
			kind: 'element',
			width: 900,
			height: 260,
		},
	});
});

test('accepts element drag data with null dimensions', () => {
	const elementWithoutDimensions = {...validElement, dimensions: null};
	expect(
		parseElementDragData(
			JSON.stringify(makeElementDragData(elementWithoutDimensions)),
		),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: elementWithoutDimensions,
		preview: {kind: 'element'},
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
				element: {
					...validElement,
					sourceCode: 'export const lowerThird = () => null;',
				},
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
				element: {...validElement, dimensions: {width: 0, height: 260}},
			}),
		),
	).toBe(null);
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: {...validElement, dependencies: ['--ignore-scripts']},
			}),
		),
	).toBe(null);
});
