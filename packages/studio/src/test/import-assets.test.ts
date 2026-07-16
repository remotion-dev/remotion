import {expect, test} from 'bun:test';
import {
	getAssetElement,
	getAssetElementFromPath,
	getComponentDimensions,
	getElementPositionForDrop,
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

test('maps animated PNG file types to AnimatedImage assets', () => {
	expect(
		getAssetElement({
			fileType: {
				type: 'apng',
				dimensions: {width: 320, height: 180},
			},
			src: 'animated-png.png',
		}),
	).toEqual({
		type: 'asset',
		assetType: 'animated-image',
		src: 'animated-png.png',
		srcType: 'static',
		dimensions: {width: 320, height: 180},
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
	expect(getAssetElementFromPath('animation.apng')).toEqual({
		type: 'asset',
		assetType: 'animated-image',
		src: 'animation.apng',
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

test('does not map unsupported existing static file paths', () => {
	expect(getAssetElementFromPath('data.json')).toBe(null);
	expect(getAssetElementFromPath('asset-without-extension')).toBe(null);
	expect(getAssetElementFromPath('nested\\photo.png')).toBe(null);
});

test('uses explicit component dimensions from drag data', () => {
	expect(
		getComponentDimensions({
			componentName: 'Heart',
			dimensions: {width: 110, height: 100},
			importName: 'Heart',
			importPath: '@remotion/shapes',
			props: [
				{name: 'height', value: 100},
				{name: 'aspectRatio', value: 1.1},
			],
		}),
	).toEqual({width: 110, height: 100});
});

test('falls back to generic component dimensions', () => {
	expect(
		getComponentDimensions({
			componentName: 'CustomBox',
			importName: 'CustomBox',
			importPath: './CustomBox',
			props: [
				{name: 'width', value: 320},
				{name: 'height', value: 180},
			],
		}),
	).toEqual({width: 320, height: 180});
});

test('places dimensionless Elements at the composition origin', () => {
	expect(
		getElementPositionForDrop({
			dimensions: null,
			dropPosition: {centerX: 500, centerY: 300},
		}),
	).toBe(null);
});

test('centers fixed-size Elements at the drop position', () => {
	expect(
		getElementPositionForDrop({
			dimensions: {width: 680, height: 138},
			dropPosition: {centerX: 500, centerY: 300},
		}),
	).toEqual({x: 160, y: 231});
});

test('does not position Elements without a drop position', () => {
	expect(
		getElementPositionForDrop({
			dimensions: {width: 680, height: 138},
			dropPosition: null,
		}),
	).toBe(null);
});
