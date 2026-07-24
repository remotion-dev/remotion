import {expect, test} from 'bun:test';
import {
	DragAndDropInternals,
	type MakeComponentDragDataInput,
} from '@remotion/drag-and-drop';

const makeComponentDragData = (
	input: Omit<MakeComponentDragDataInput, 'type'>,
) => DragAndDropInternals.makeDragData({type: 'component', ...input}).data;
const parseComponentDragData = (payload: string) => {
	let dimensions: MakeComponentDragDataInput['dimensions'];
	try {
		const candidate = JSON.parse(payload)?.component?.dimensions;
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

	const {mimeType} = DragAndDropInternals.makeDragData({
		type: 'component',
		componentName: 'Test',
		dimensions,
		importName: 'Test',
		importPath: 'test',
		props: [],
	});
	const parsed = DragAndDropInternals.parseDragData({mimeType, payload});
	return parsed?.type === 'component' ? parsed.data : null;
};

test('parses component drag data', () => {
	expect(
		parseComponentDragData(
			JSON.stringify(
				makeComponentDragData({
					componentName: 'Circle',
					dimensions: {width: 200, height: 200},
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [
						{name: 'radius', value: 100},
						{name: 'fill', value: '#0b84ff'},
					],
				}),
			),
		),
	).toEqual({
		type: 'remotion-component',
		version: 1,
		component: {
			componentName: 'Circle',
			dimensions: {width: 200, height: 200},
			importName: 'Circle',
			importPath: '@remotion/shapes',
			props: [
				{name: 'radius', value: 100},
				{name: 'fill', value: '#0b84ff'},
			],
		},
	});
});

test('parses component drag data without dimensions', () => {
	expect(
		parseComponentDragData(
			JSON.stringify(
				makeComponentDragData({
					componentName: 'Circle',
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [{name: 'radius', value: 100}],
				}),
			),
		),
	).toEqual({
		type: 'remotion-component',
		version: 1,
		component: {
			componentName: 'Circle',
			importName: 'Circle',
			importPath: '@remotion/shapes',
			props: [{name: 'radius', value: 100}],
		},
	});
});

test('rejects invalid component drag data', () => {
	expect(parseComponentDragData('')).toBe(null);
	expect(parseComponentDragData('{')).toBe(null);
	expect(
		parseComponentDragData(
			JSON.stringify({
				type: 'remotion-component',
				version: 2,
				component: {
					componentName: 'Circle',
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [],
				},
			}),
		),
	).toBe(null);
	expect(
		parseComponentDragData(
			JSON.stringify({
				type: 'remotion-shape',
				version: 1,
				component: {
					componentName: 'Circle',
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [],
				},
			}),
		),
	).toBe(null);
	expect(
		parseComponentDragData(
			JSON.stringify({
				type: 'remotion-component',
				version: 1,
				component: {
					componentName: 'circle',
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [],
				},
			}),
		),
	).toBe(null);
	expect(
		parseComponentDragData(
			JSON.stringify({
				type: 'remotion-component',
				version: 1,
				component: {
					componentName: 'Circle',
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [{name: 'style', value: 'position: absolute'}],
				},
			}),
		),
	).toBe(null);
	expect(
		parseComponentDragData(
			JSON.stringify({
				type: 'remotion-component',
				version: 1,
				component: {
					componentName: 'Circle',
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [
						{name: 'radius', value: 100},
						{name: 'radius', value: 200},
					],
				},
			}),
		),
	).toBe(null);
	expect(
		parseComponentDragData(
			JSON.stringify({
				type: 'remotion-component',
				version: 1,
				component: {
					componentName: 'Circle',
					dimensions: {width: -100, height: 200},
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [],
				},
			}),
		),
	).toBe(null);
});
