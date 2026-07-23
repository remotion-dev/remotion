import {expect, test} from 'bun:test';
import {makeAssetDragData, parseAssetDragData} from '@remotion/drag-and-drop';

test('parses asset drag data', () => {
	expect(
		parseAssetDragData(JSON.stringify(makeAssetDragData('nested/image.png'))),
	).toEqual({
		type: 'remotion-asset',
		version: 1,
		assetPath: 'nested/image.png',
		preview: {kind: 'asset'},
	});
});

test('rejects invalid asset drag data', () => {
	expect(parseAssetDragData('')).toBe(null);
	expect(parseAssetDragData('{')).toBe(null);
	expect(
		parseAssetDragData(
			JSON.stringify({
				type: 'remotion-asset',
				version: 2,
				assetPath: 'image.png',
			}),
		),
	).toBe(null);
	expect(
		parseAssetDragData(
			JSON.stringify({
				type: 'remotion-asset',
				version: 1,
				assetPath: '',
			}),
		),
	).toBe(null);
});
