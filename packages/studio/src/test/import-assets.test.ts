import {expect, test} from 'bun:test';
import {
	getAssetElement,
	getAssetElementFromPath,
	getAssetElementFromStaticFilePath,
} from '../components/import-assets';

const minimalApng = new Uint8Array([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
	0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x32, 0x08, 0x06,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x61, 0x63,
	0x54, 0x4c, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00,
]);

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
			srcType: 'static',
			dimensions: null,
			position: null,
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

test('maps APNG file type to AnimatedImage assets', () => {
	expect(
		getAssetElement({
			fileType: {
				type: 'apng',
				dimensions: {
					width: 100,
					height: 50,
				},
			},
			src: 'animation.png',
		}),
	).toEqual({
		type: 'asset',
		assetType: 'animated-image',
		src: 'animation.png',
		srcType: 'static',
		dimensions: {
			width: 100,
			height: 50,
		},
		position: null,
	});
});

test('maps existing static file paths to insertable assets', () => {
	expect(getAssetElementFromPath('nested/photo.JPG')).toEqual({
		type: 'asset',
		assetType: 'image',
		src: 'nested/photo.JPG',
		srcType: 'static',
		dimensions: null,
		position: null,
	});
	expect(getAssetElementFromPath('movie.webm')).toEqual({
		type: 'asset',
		assetType: 'video',
		src: 'movie.webm',
		srcType: 'static',
		dimensions: null,
		position: null,
	});
	expect(getAssetElementFromPath('audio.flac')).toEqual({
		type: 'asset',
		assetType: 'audio',
		src: 'audio.flac',
		srcType: 'static',
		dimensions: null,
		position: null,
	});
	expect(getAssetElementFromPath('animation.gif')).toEqual({
		type: 'asset',
		assetType: 'gif',
		src: 'animation.gif',
		srcType: 'static',
		dimensions: null,
		position: null,
	});
});

test('sniffs existing PNG static files for APNG assets', async () => {
	const originalFetch = globalThis.fetch;

	globalThis.fetch = Object.assign(
		async (input: Parameters<typeof fetch>[0]) => {
			expect(input.toString()).toBe('/animation.png');

			return new Response(minimalApng, {
				headers: {
					'content-length': String(minimalApng.byteLength),
				},
				status: 200,
			});
		},
		{
			preconnect: originalFetch.preconnect,
		},
	);

	try {
		expect(await getAssetElementFromStaticFilePath('animation.png')).toEqual({
			type: 'asset',
			assetType: 'animated-image',
			src: 'animation.png',
			srcType: 'static',
			dimensions: {
				width: 100,
				height: 50,
			},
			position: null,
		});
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('does not map unsupported existing static file paths', () => {
	expect(getAssetElementFromPath('data.json')).toBe(null);
	expect(getAssetElementFromPath('asset-without-extension')).toBe(null);
	expect(getAssetElementFromPath('nested\\photo.png')).toBe(null);
});
