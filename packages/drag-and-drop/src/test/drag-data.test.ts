import {expect, test} from 'bun:test';
import {
	DragAndDropInternals,
	type MakeCompositionDragDataInput,
	type MakeDragDataInput,
	type MakeElementDragDataInput,
	type MakeAssetDragDataInput,
} from '../index';

const inputs: MakeDragDataInput[] = [
	{
		type: 'asset',
		assetPath: 'nested/image.png',
		width: 1920,
		height: 1080,
		durationInSeconds: 5,
	},
	{
		type: 'component',
		componentName: 'Circle',
		dimensions: {width: 200, height: 200},
		importName: 'Circle',
		importPath: '@remotion/shapes',
		props: [{name: 'radius', value: 100}],
	},
	{
		type: 'composition',
		compositionFile: 'src/Root.tsx',
		compositionId: 'MyVideo',
		width: 1920,
		height: 1080,
		durationInFrames: 150,
	},
	{
		type: 'effect',
		name: 'brightness',
		importPath: '@remotion/effects/brightness',
		config: {brightness: 1.2},
	},
	{
		type: 'element',
		dependencies: ['@remotion/google-fonts'],
		slug: 'overlays/lower-third',
		displayName: 'Lower Third',
		sourceCode: 'export const LowerThird = () => null;',
		dimensions: {width: 900, height: 260},
		durationInFrames: 90,
	},
	{
		type: 'sfx',
		name: 'Whip',
		url: 'https://remotion.media/whip.wav',
	},
];

test('constructs and parses all drag data families', () => {
	for (const input of inputs) {
		const constructed = DragAndDropInternals.makeDragData(input);
		const parsed = DragAndDropInternals.parseDragData(constructed);

		expect(parsed?.type).toBe(input.type);
		expect(constructed.mimeType).toStartWith(
			'application/vnd.remotion.drag+json;v=1;type=',
		);
		expect(JSON.parse(constructed.payload)).toBeObject();
	}
});

test('puts preview metadata in the same MIME type as the payload', () => {
	const constructed = DragAndDropInternals.makeDragData({
		type: 'composition',
		compositionFile: 'src/Root.tsx',
		compositionId: 'MyVideo',
		width: 1920,
		height: 1080,
		durationInFrames: 150,
	});

	expect(constructed.mimeType).toBe(
		'application/vnd.remotion.drag+json;v=1;type=composition;width=1920;height=1080;duration=150',
	);
	expect(
		DragAndDropInternals.getDragPreviewMetadata([
			'text/plain',
			constructed.mimeType,
		]),
	).toEqual({
		type: 'composition',
		mimeType: constructed.mimeType,
		width: 1920,
		height: 1080,
		durationInFrames: 150,
	});
	expect(DragAndDropInternals.parseDragData(constructed)).toEqual({
		type: 'composition',
		data: {
			type: 'remotion-composition',
			version: 1,
			compositionFile: 'src/Root.tsx',
			compositionId: 'MyVideo',
		},
		preview: {
			type: 'composition',
			width: 1920,
			height: 1080,
			durationInFrames: 150,
		},
	});
});

test('accepts explicit null composition metadata', () => {
	const constructed = DragAndDropInternals.makeDragData({
		type: 'composition',
		compositionFile: null,
		compositionId: 'UnresolvedVideo',
		width: null,
		height: null,
		durationInFrames: null,
	});

	expect(constructed.mimeType).toBe(
		'application/vnd.remotion.drag+json;v=1;type=composition',
	);
	expect(DragAndDropInternals.parseDragData(constructed)?.preview).toEqual({
		type: 'composition',
	});
	expect(() =>
		DragAndDropInternals.makeDragData({
			type: 'composition',
			compositionFile: null,
			compositionId: 'MissingMetadata',
		} as MakeCompositionDragDataInput),
	).toThrow('must be set to a value or null');
	expect(() =>
		DragAndDropInternals.makeDragData({
			type: 'composition',
			compositionFile: null,
			compositionId: 'PartiallyResolvedDimensions',
			width: 1920,
			height: null,
			durationInFrames: null,
		}),
	).toThrow('must either both be numbers or both be null');
});

test('requires asset metadata and accepts explicit null values', () => {
	const constructed = DragAndDropInternals.makeDragData({
		type: 'asset',
		assetPath: 'unresolved.png',
		width: null,
		height: null,
		durationInSeconds: null,
	});

	expect(constructed.mimeType).toBe(
		'application/vnd.remotion.drag+json;v=1;type=asset',
	);
	expect(DragAndDropInternals.parseDragData(constructed)?.preview).toEqual({
		type: 'asset',
	});
	expect(() =>
		DragAndDropInternals.makeDragData({
			type: 'asset',
			assetPath: 'missing-metadata.png',
		} as MakeAssetDragDataInput),
	).toThrow('must be set to a value or null');
	expect(() =>
		DragAndDropInternals.makeDragData({
			type: 'asset',
			assetPath: 'partially-resolved.png',
			width: 1920,
			height: null,
			durationInSeconds: null,
		}),
	).toThrow('must either both be numbers or both be null');
});

test('requires a duration for element drags', () => {
	const constructed = DragAndDropInternals.makeDragData({
		type: 'element',
		dependencies: [],
		slug: 'titles/lower-third',
		displayName: 'Lower Third',
		sourceCode: 'export const LowerThird = () => null;',
		dimensions: null,
		durationInFrames: 90,
	});

	expect(constructed.mimeType).toContain(';duration=90');
	expect(
		DragAndDropInternals.parseDragData({
			mimeType: 'application/vnd.remotion.drag+json;v=1;type=element',
			payload: constructed.payload,
		}),
	).toBe(null);
	expect(() =>
		DragAndDropInternals.makeDragData({
			type: 'element',
			dependencies: [],
			slug: 'titles/lower-third',
			displayName: 'Lower Third',
			sourceCode: 'export const LowerThird = () => null;',
			dimensions: null,
		} as unknown as MakeElementDragDataInput),
	).toThrow('durationInFrames must be an integer');
});

test('rejects malformed and mismatched drag data', () => {
	expect(
		DragAndDropInternals.parseDragData({
			mimeType:
				'application/vnd.remotion.drag+json;v=1;type=component;width=10;height=10',
			payload: JSON.stringify({
				type: 'remotion-component',
				version: 1,
				component: {
					componentName: 'Circle',
					dimensions: {width: 20, height: 20},
					importName: 'Circle',
					importPath: '@remotion/shapes',
					props: [],
				},
			}),
		}),
	).toBe(null);

	const invalidMimeTypes = [
		'application/vnd.remotion.drag+json;v=2;type=composition',
		'application/vnd.remotion.drag+json;v=1;type=unknown',
		'application/vnd.remotion.drag+json;v=1;type=element;width=1920',
		'application/vnd.remotion.drag+json;v=1;type=effect;duration=10',
		'application/vnd.remotion.drag+json;v=1;type=composition;secret=value',
	];

	for (const mimeType of invalidMimeTypes) {
		expect(DragAndDropInternals.getDragPreviewMetadata([mimeType])).toBe(null);
		expect(DragAndDropInternals.parseDragData({mimeType, payload: '{}'})).toBe(
			null,
		);
	}
});
