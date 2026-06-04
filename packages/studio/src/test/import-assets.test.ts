import {expect, test} from 'bun:test';
import {
	getAssetElement,
	getAssetElementFromPath,
} from '../components/import-assets';

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

test('maps existing static file paths to insertable assets', () => {
	expect(getAssetElementFromPath('nested/photo.JPG')).toEqual({
		type: 'asset',
		assetType: 'image',
		src: 'nested/photo.JPG',
		dimensions: null,
	});
	expect(getAssetElementFromPath('movie.webm')).toEqual({
		type: 'asset',
		assetType: 'video',
		src: 'movie.webm',
		dimensions: null,
	});
	expect(getAssetElementFromPath('audio.flac')).toEqual({
		type: 'asset',
		assetType: 'audio',
		src: 'audio.flac',
		dimensions: null,
	});
	expect(getAssetElementFromPath('animation.gif')).toEqual({
		type: 'asset',
		assetType: 'gif',
		src: 'animation.gif',
		dimensions: null,
	});
});

test('does not map unsupported existing static file paths', () => {
	expect(getAssetElementFromPath('data.json')).toBe(null);
	expect(getAssetElementFromPath('asset-without-extension')).toBe(null);
	expect(getAssetElementFromPath('nested\\photo.png')).toBe(null);
});
