import {expect, test} from 'bun:test';
import {parseSfxDragData, type SfxDragData} from '../sfx-drag-data';
import {isUrl} from '../url';

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
