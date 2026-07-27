import {expect, test} from 'bun:test';
import type {StaticFile} from '../api/get-static-files';
import {
	filterAssetsByType,
	getAssetSearchQueryForComponent,
} from '../components/QuickSwitcher/asset-search';

const assets: StaticFile[] = [
	{
		lastModified: 0,
		name: 'audio/theme.mp3',
		sizeInBytes: 1,
		src: '/audio/theme.mp3',
	},
	{
		lastModified: 0,
		name: 'images/logo.png',
		sizeInBytes: 1,
		src: '/images/logo.png',
	},
	{
		lastModified: 0,
		name: 'videos/intro.mp4',
		sizeInBytes: 1,
		src: '/videos/intro.mp4',
	},
];

test('filters quick switcher assets by type', () => {
	const result = filterAssetsByType({
		assets,
		query: 'intro type:video clip',
	});

	expect(result.query).toBe('intro clip');
	expect(result.assets.map((asset) => asset.name)).toEqual([
		'videos/intro.mp4',
	]);
});

test('supports multiple asset type filters', () => {
	const result = filterAssetsByType({
		assets,
		query: 'type:audio type:IMAGE',
	});

	expect(result.query).toBe('');
	expect(result.assets.map((asset) => asset.name)).toEqual([
		'audio/theme.mp3',
		'images/logo.png',
	]);
});

test('returns no assets for an unknown asset type', () => {
	const result = filterAssetsByType({
		assets,
		query: 'type:spreadsheet',
	});

	expect(result.query).toBe('');
	expect(result.assets).toEqual([]);
});

test('gets an asset type query for interactive media components', () => {
	expect(getAssetSearchQueryForComponent('dev.remotion.media.Video')).toBe(
		'type:video ',
	);
	expect(getAssetSearchQueryForComponent('dev.remotion.media.Audio')).toBe(
		'type:audio ',
	);
	expect(getAssetSearchQueryForComponent('dev.remotion.remotion.Img')).toBe(
		'type:image ',
	);
	expect(
		getAssetSearchQueryForComponent('dev.remotion.remotion.AnimatedImage'),
	).toBe('type:image ');
	expect(getAssetSearchQueryForComponent('com.example.Custom')).toBe('');
	expect(getAssetSearchQueryForComponent(null)).toBe('');
});
