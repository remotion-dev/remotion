import {expect, test} from 'bun:test';
import {getAssetElement} from '../components/import-assets';

test('maps audio file types to Audio assets', () => {
	for (const type of ['wav', 'mp3', 'aac', 'flac'] as const) {
		expect(
			getAssetElement({
				fileType: {type},
				src: `sound.${type}`,
			}),
		).toEqual({
			type: 'asset',
			assetType: 'audio',
			src: `sound.${type}`,
			dimensions: null,
		});
	}
});

test('does not map M3U playlists to Audio assets', () => {
	expect(
		getAssetElement({
			fileType: {type: 'm3u'},
			src: 'playlist.m3u',
		}),
	).toBe(null);
});
