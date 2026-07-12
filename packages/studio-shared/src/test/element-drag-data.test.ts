import {expect, test} from 'bun:test';
import {
	makeElementDragData,
	makeElementFileNameFromSlug,
	parseElementDragData,
} from '../element-drag-data';

const validElement = {
	slug: 'overlays/lower-third',
	displayName: 'Lower Third',
	sourceCode: 'export const LowerThird = () => null;',
	dimensions: {width: 900, height: 260},
};

const validElementWithDependencies = {
	...validElement,
	dependencies: [],
};

test('parses element drag data', () => {
	expect(
		parseElementDragData(JSON.stringify(makeElementDragData(validElement))),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: validElementWithDependencies,
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
		element: {...elementWithoutDimensions, dependencies: []},
	});
});

test('derives element dependencies from source code imports', () => {
	const element = {
		...validElement,
		sourceCode: [
			"import React from 'react';",
			"import {loadFont} from '@remotion/google-fonts/Inter';",
			"import {paper} from '@remotion/effects/paper';",
			"import {z} from 'zod';",
			"import {AbsoluteFill} from 'remotion';",
			'export const LowerThird = () => null;',
		].join('\n'),
	};

	expect(makeElementDragData(element).element.dependencies).toEqual([
		'@remotion/google-fonts',
		'@remotion/effects',
		'zod',
	]);
});

test('parses old element drag data without dependencies', () => {
	expect(
		parseElementDragData(
			JSON.stringify({
				type: 'remotion-element',
				version: 1,
				element: validElement,
			}),
		)?.element.dependencies,
	).toEqual([]);
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
				element: {...validElement, dependencies: ['left-pad']},
			}),
		),
	).toBe(null);
});
