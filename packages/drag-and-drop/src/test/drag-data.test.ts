import {expect, test} from 'bun:test';
import {
	makeAssetDragData,
	makeComponentDragData,
	makeCompositionDragData,
	makeDragPreviewMimeType,
	makeEffectDragData,
	makeElementDragData,
	makeSfxDragData,
	parseAssetDragData,
	parseComponentDragData,
	parseCompositionDragData,
	parseDragPreviewMimeType,
	parseEffectDragData,
	parseElementDragData,
	parseSfxDragData,
	getDragPreviewMetadata,
	setDragPreviewMetadata,
} from '../index';

test('constructs and parses all payload families', () => {
	const payloads = [
		[makeAssetDragData('nested/image.png'), parseAssetDragData],
		[
			makeComponentDragData({
				componentName: 'Circle',
				dimensions: {width: 200, height: 200},
				importName: 'Circle',
				importPath: '@remotion/shapes',
				props: [{name: 'radius', value: 100}],
			}),
			parseComponentDragData,
		],
		[
			makeCompositionDragData({
				compositionFile: 'src/Root.tsx',
				compositionId: 'MyVideo',
			}),
			parseCompositionDragData,
		],
		[
			makeEffectDragData({
				name: 'brightness',
				importPath: '@remotion/effects/brightness',
				config: {brightness: 1.2},
			}),
			parseEffectDragData,
		],
		[
			makeElementDragData({
				dependencies: ['@remotion/google-fonts'],
				slug: 'overlays/lower-third',
				displayName: 'Lower Third',
				sourceCode: 'export const LowerThird = () => null;',
				dimensions: {width: 900, height: 260},
			}),
			parseElementDragData,
		],
		[
			makeSfxDragData({
				name: 'Whip',
				url: 'https://remotion.media/whip.wav',
			}),
			parseSfxDragData,
		],
	] as const;

	for (const [payload, parse] of payloads) {
		expect(parse(JSON.stringify(payload))).toEqual(payload);
	}
});

test('rejects malformed or mismatched payloads', () => {
	const parsers = [
		parseAssetDragData,
		parseComponentDragData,
		parseCompositionDragData,
		parseEffectDragData,
		parseElementDragData,
		parseSfxDragData,
	];

	for (const parse of parsers) {
		expect(parse('')).toBe(null);
		expect(parse('{')).toBe(null);
		expect(parse('{"type":"unknown","version":1}')).toBe(null);
	}
});

test('constructs and parses preview MIME types', () => {
	const compositionMimeType = makeDragPreviewMimeType({
		kind: 'composition',
		width: 1920,
		height: 1080,
		durationInFrames: 150,
	});

	expect(compositionMimeType).toBe(
		'application/vnd.remotion.preview;v=1;kind=composition;width=1920;height=1080;duration=150',
	);
	expect(parseDragPreviewMimeType(compositionMimeType)).toEqual({
		kind: 'composition',
		width: 1920,
		height: 1080,
		durationInFrames: 150,
	});

	const assetMimeType = makeDragPreviewMimeType({
		kind: 'asset',
		durationInSeconds: 2.5,
	});
	expect(parseDragPreviewMimeType(assetMimeType)).toEqual({
		kind: 'asset',
		durationInSeconds: 2.5,
	});
});

test('sets and finds preview metadata without reading the payload', () => {
	const entries = new Map<string, string>();
	const mimeType = setDragPreviewMetadata(
		{
			setData: (format, data) => {
				entries.set(format, data);
			},
		},
		{kind: 'element', width: 800, height: 450, durationInFrames: 90},
	);

	expect(entries.get(mimeType)).toBe('');
	expect(getDragPreviewMetadata(['text/plain', mimeType])).toEqual({
		kind: 'element',
		width: 800,
		height: 450,
		durationInFrames: 90,
	});
});

test('rejects malformed or unsafe preview MIME types', () => {
	const invalidMimeTypes = [
		'application/vnd.remotion.preview;v=2;kind=composition',
		'application/vnd.remotion.preview;v=1;kind=unknown',
		'application/vnd.remotion.preview;v=1;kind=element;width=1920',
		'application/vnd.remotion.preview;v=1;kind=element;width=0;height=1080',
		'application/vnd.remotion.preview;v=1;kind=element;width=1920;height=1080;duration=-1',
		'application/vnd.remotion.preview;v=1;kind=composition;kind=asset',
		'application/vnd.remotion.preview;v=1;kind=composition;secret=value',
	];

	for (const mimeType of invalidMimeTypes) {
		expect(parseDragPreviewMimeType(mimeType)).toBe(null);
	}
});
