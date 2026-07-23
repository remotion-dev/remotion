import {expect, test} from 'bun:test';
import {makeDragData, parseDragData} from '@remotion/drag-and-drop';

const assetMimeType = makeDragData({
	type: 'asset',
	assetPath: 'asset',
	width: null,
	height: null,
	durationInSeconds: null,
}).mimeType;
const makeAssetDragData = (assetPath: string) =>
	makeDragData({
		type: 'asset',
		assetPath,
		width: null,
		height: null,
		durationInSeconds: null,
	}).data;
const parseAssetDragData = (payload: string) => {
	const parsed = parseDragData({mimeType: assetMimeType, payload});
	return parsed?.type === 'asset' ? parsed.data : null;
};

test('parses asset drag data', () => {
	expect(
		parseAssetDragData(JSON.stringify(makeAssetDragData('nested/image.png'))),
	).toEqual({
		type: 'remotion-asset',
		version: 1,
		assetPath: 'nested/image.png',
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
