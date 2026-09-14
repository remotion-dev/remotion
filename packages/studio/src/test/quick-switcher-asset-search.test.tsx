import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import type {AssetFieldSchema} from 'remotion';
import type {StaticFile} from '../api/get-static-files';
import {filterAssetsByType} from '../components/QuickSwitcher/asset-search';
import {TimelineAssetField} from '../components/Timeline/TimelineAssetField';
import {SetSelectedModalContext, type ModalState} from '../state/modals';

afterEach(cleanup);

const assets: StaticFile[] = [
	{
		lastModified: 0,
		name: 'audio/theme.mp3',
		sizeInBytes: 1,
		src: '/audio/theme.mp3',
	},
	{
		lastModified: 0,
		name: 'audio/podcast.m4a',
		sizeInBytes: 1,
		src: '/audio/podcast.m4a',
	},
	{
		lastModified: 0,
		name: 'audio/lossless.flac',
		sizeInBytes: 1,
		src: '/audio/lossless.flac',
	},
	{
		lastModified: 0,
		name: 'images/logo.png',
		sizeInBytes: 1,
		src: '/images/logo.png',
	},
	{
		lastModified: 0,
		name: 'images/vector.svg',
		sizeInBytes: 1,
		src: '/images/vector.svg',
	},
	{
		lastModified: 0,
		name: 'videos/intro.mp4',
		sizeInBytes: 1,
		src: '/videos/intro.mp4',
	},
	{
		lastModified: 0,
		name: 'videos/trailer.m4v',
		sizeInBytes: 1,
		src: '/videos/trailer.m4v',
	},
	{
		lastModified: 0,
		name: 'videos/stream.ts',
		sizeInBytes: 1,
		src: '/videos/stream.ts',
	},
	{
		lastModified: 0,
		name: 'videos/stream.m2ts',
		sizeInBytes: 1,
		src: '/videos/stream.m2ts',
	},
	{
		lastModified: 0,
		name: 'videos/playlist.m3u8',
		sizeInBytes: 1,
		src: '/videos/playlist.m3u8',
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
		'videos/trailer.m4v',
		'videos/stream.ts',
		'videos/stream.m2ts',
		'videos/playlist.m3u8',
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
		'audio/podcast.m4a',
		'audio/lossless.flac',
		'images/logo.png',
		'images/vector.svg',
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

test('an audio asset field includes only audio files', () => {
	const fieldSchema = {
		type: 'asset',
		assetType: 'audio',
		default: undefined,
	} satisfies AssetFieldSchema;
	let selectedModal: ModalState | null = null;

	render(
		<SetSelectedModalContext.Provider
			value={{
				setSelectedModal: (update) => {
					selectedModal =
						typeof update === 'function' ? update(selectedModal) : update;
				},
			}}
		>
			<TimelineAssetField
				field={{
					key: 'audioSrc',
					description: 'Audio source',
					typeName: 'asset',
					rowHeight: 22,
					fieldSchema,
					group: 'source',
				}}
				propStatus={{
					status: 'static',
					codeValue: undefined,
					keyframeDisplayOffsetAdjustment: null,
				}}
				effectiveValue={undefined}
				onSave={() => Promise.resolve()}
				onDragValueChange={() => undefined}
				onDragEnd={() => undefined}
			/>
		</SetSelectedModalContext.Provider>,
	);

	fireEvent.click(screen.getByRole('button', {name: 'Change source'}));
	const modal = selectedModal as ModalState | null;
	if (modal?.type !== 'quick-switcher' || modal.assetSelection === null) {
		throw new Error('Expected asset Quick Switcher to open');
	}

	const result = filterAssetsByType({
		assets,
		query: modal.assetSelection.initialQuery,
	});

	expect(result.assets.map((asset) => asset.name)).toEqual([
		'audio/theme.mp3',
		'audio/podcast.m4a',
		'audio/lossless.flac',
	]);
});

test('an image asset filter includes SVG files', () => {
	const result = filterAssetsByType({
		assets,
		query: 'type:image ',
	});

	expect(result.assets.map((asset) => asset.name)).toEqual([
		'images/logo.png',
		'images/vector.svg',
	]);
});
