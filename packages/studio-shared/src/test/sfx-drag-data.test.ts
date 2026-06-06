import {expect, test} from 'bun:test';
import {
	isRemotionSfxUrl,
	parseSfxDragData,
	type SfxDragData,
} from '../sfx-drag-data';

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

test('validates remotion.media SFX URLs', () => {
	expect(isRemotionSfxUrl('https://remotion.media/whip.wav')).toBe(true);
	expect(isRemotionSfxUrl('http://remotion.media/whip.wav')).toBe(false);
	expect(isRemotionSfxUrl('https://example.com/whip.wav')).toBe(false);
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
					url: 'https://example.com/whip.wav',
				},
			}),
		),
	).toBe(null);
});
