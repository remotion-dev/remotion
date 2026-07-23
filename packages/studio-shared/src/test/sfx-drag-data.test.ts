import {expect, test} from 'bun:test';
import {
	makeDragData,
	parseDragData,
	type SfxDragData,
} from '@remotion/drag-and-drop';
import {isUrl} from '../url';

const sfxMimeType = makeDragData({
	type: 'sfx',
	name: 'Test',
	url: 'https://remotion.media/test.wav',
}).mimeType;
const parseSfxDragData = (payload: string) => {
	const parsed = parseDragData({mimeType: sfxMimeType, payload});
	return parsed?.type === 'sfx' ? parsed.data : null;
};

const validSfxDragData: SfxDragData = {
	type: 'remotion-sfx',
	version: 1,
	sfx: {
		name: 'whip',
		url: 'https://remotion.media/whip.wav',
	},
};

test('parses SFX drag data', () => {
	expect(parseSfxDragData(JSON.stringify(validSfxDragData))).toEqual(
		validSfxDragData,
	);
});

test('accepts any URL in SFX drag data', () => {
	const nonRemotionUrlDragData: SfxDragData = {
		...validSfxDragData,
		sfx: {
			...validSfxDragData.sfx,
			url: 'https://example.com/whip.wav',
		},
	};
	expect(parseSfxDragData(JSON.stringify(nonRemotionUrlDragData))).toEqual(
		nonRemotionUrlDragData,
	);
	expect(isUrl('https://remotion.media/whip.wav')).toBe(true);
	expect(isUrl('https://example.com/whip.wav')).toBe(true);
	expect(isUrl('not-a-url')).toBe(false);
});

test('rejects invalid SFX drag data', () => {
	expect(parseSfxDragData('')).toBe(null);
	expect(parseSfxDragData('{')).toBe(null);
	expect(
		parseSfxDragData(
			JSON.stringify({
				...validSfxDragData,
				version: 2,
			}),
		),
	).toBe(null);
	expect(
		parseSfxDragData(
			JSON.stringify({
				...validSfxDragData,
				sfx: {
					...validSfxDragData.sfx,
					name: '',
				},
			}),
		),
	).toBe(null);
	expect(
		parseSfxDragData(
			JSON.stringify({
				...validSfxDragData,
				sfx: {
					...validSfxDragData.sfx,
					url: 'not-a-url',
				},
			}),
		),
	).toBe(null);
});
