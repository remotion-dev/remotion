import {expect, test} from 'bun:test';
import {
	StudioProtocolInternals,
	type ElementDragData,
} from '@remotion/studio-protocol';

type ElementInput = Omit<ElementDragData['element'], 'durationInFrames'>;

const validElement = {
	dependencies: [{name: '@remotion/google-fonts', version: null}],
	slug: 'overlays/lower-third',
	displayName: 'Lower Third',
	sourceCode: 'export const LowerThird = () => null;',
	dimensions: {width: 900, height: 260},
} satisfies ElementInput;
const makeElementDragData = (element: ElementInput) =>
	StudioProtocolInternals.makeDragData({
		type: 'element',
		...element,
		durationInFrames: 120,
	}).data;
const parseElementDragData = (payload: string) => {
	let dimensions: (typeof validElement)['dimensions'] | null = null;
	try {
		const candidate = JSON.parse(payload)?.element?.dimensions;
		if (
			typeof candidate?.width === 'number' &&
			candidate.width > 0 &&
			typeof candidate?.height === 'number' &&
			candidate.height > 0
		) {
			dimensions = candidate;
		}
	} catch {
		// The unified parser handles the malformed payload below.
	}

	const {mimeType} = StudioProtocolInternals.makeDragData({
		type: 'element',
		...validElement,
		dimensions,
		durationInFrames: 120,
	});
	const parsed = StudioProtocolInternals.parseDragData({mimeType, payload});
	return parsed?.type === 'element' ? parsed.data : null;
};

test('parses element drag data', () => {
	expect(
		parseElementDragData(JSON.stringify(makeElementDragData(validElement))),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: {...validElement, durationInFrames: 120},
	});
});

test('rejects element drag data without dependencies', () => {
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
	).toBe(null);
});

test('preserves component-owned-sequence Element drag data', () => {
	const componentOwnedSequenceElement = {
		...validElement,
		installationMode: 'component-owned-sequence' as const,
	};
	expect(
		parseElementDragData(
			JSON.stringify(makeElementDragData(componentOwnedSequenceElement)),
		),
	).toEqual({
		type: 'remotion-element',
		version: 1,
		element: {...componentOwnedSequenceElement, durationInFrames: 120},
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
		element: {...elementWithoutDimensions, durationInFrames: 120},
	});
});

test('derives element file name from slug', () => {
	expect(
		StudioProtocolInternals.makeElementFileNameFromSlug('overlays/lower-third'),
	).toBe('lower-third.element.tsx');
	expect(
		StudioProtocolInternals.makeElementFileNameFromSlug('LowerThird'),
	).toBe(null);
	expect(
		StudioProtocolInternals.makeElementFileNameFromSlug(
			'overlays/../lower-third',
		),
	).toBe(null);
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
				element: {...validElement, installationMode: 'no'},
			}),
		),
	).toBe(null);
	for (const dependencies of [
		['@remotion/google-fonts'],
		['--ignore-scripts'],
		[{name: 'lodash', version: null}],
		[{name: 'lodash', version: '^4.17.21'}],
		[{name: '@remotion/effects', version: '4.0.0'}],
	]) {
		expect(
			parseElementDragData(
				JSON.stringify({
					type: 'remotion-element',
					version: 1,
					element: {...validElement, dependencies},
				}),
			),
		).toBe(null);
	}
});
