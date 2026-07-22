import {expect, test} from 'bun:test';
import {
	compositionDragDataToSymbolicatedStack,
	makeCompositionDragData,
	parseCompositionDragData,
} from '../composition-drag-data';

test('parses composition drag data', () => {
	expect(
		parseCompositionDragData(
			JSON.stringify(
				makeCompositionDragData({
					compositionFile: 'src/Root.tsx',
					compositionId: 'MyVideo',
				}),
			),
		),
	).toEqual({
		type: 'remotion-composition',
		version: 1,
		compositionFile: 'src/Root.tsx',
		compositionId: 'MyVideo',
	});
});

test('allows a missing composition file', () => {
	expect(
		parseCompositionDragData(
			JSON.stringify(
				makeCompositionDragData({
					compositionFile: null,
					compositionId: 'MyVideo',
				}),
			),
		),
	).toEqual({
		type: 'remotion-composition',
		version: 1,
		compositionFile: null,
		compositionId: 'MyVideo',
	});
});

test('converts composition drag data to a symbolicated stack', () => {
	expect(
		compositionDragDataToSymbolicatedStack(
			makeCompositionDragData({
				compositionFile: 'src/Root.tsx',
				compositionId: 'MyVideo',
			}),
		),
	).toEqual({
		originalColumnNumber: null,
		originalFileName: 'src/Root.tsx',
		originalFunctionName: null,
		originalLineNumber: null,
		originalScriptCode: null,
	});

	expect(
		compositionDragDataToSymbolicatedStack(
			makeCompositionDragData({
				compositionFile: null,
				compositionId: 'MyVideo',
			}),
		),
	).toBe(null);
});

test('rejects invalid composition drag data', () => {
	expect(parseCompositionDragData('')).toBe(null);
	expect(parseCompositionDragData('{')).toBe(null);
	expect(
		parseCompositionDragData(
			JSON.stringify({
				type: 'remotion-composition',
				version: 1,
				compositionFile: '/tmp/Root.tsx',
				compositionId: 'MyVideo',
			}),
		),
	).toBe(null);
	expect(
		parseCompositionDragData(
			JSON.stringify({
				type: 'remotion-composition',
				version: 1,
				compositionFile: '../Root.tsx',
				compositionId: 'MyVideo',
			}),
		),
	).toBe(null);
	expect(
		parseCompositionDragData(
			JSON.stringify({
				type: 'remotion-composition',
				version: 1,
				compositionFile: 'src/Root.tsx',
				compositionId: '',
			}),
		),
	).toBe(null);
	expect(
		parseCompositionDragData(
			JSON.stringify({
				type: 'remotion-composition',
				version: 1,
				compositionFile: 'src/Root.tsx',
				compositionId: 'Invalid id',
			}),
		),
	).toBe(null);
});
