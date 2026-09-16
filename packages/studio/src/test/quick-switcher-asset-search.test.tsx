import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import type {AssetFieldSchema} from 'remotion';
import type {StaticFile} from '../api/get-static-files';
import {AssetSelectorModal} from '../components/AssetSelectorModal';
import {portals} from '../components/Menu/portals';
import {filterAssetsByType} from '../components/QuickSwitcher/asset-search';
import {
	AssetSelectionContext,
	TimelineAssetField,
} from '../components/Timeline/TimelineAssetField';
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
	if (modal?.type !== 'asset-selection' || modal.assetType !== 'audio') {
		throw new Error('Expected audio asset selector to open');
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

test('an image asset field replaces a protocol-relative URL', () => {
	const fieldSchema = {
		type: 'asset',
		assetType: 'image',
		default: undefined,
	} satisfies AssetFieldSchema;
	const url = '//cdn.example.com/images/avatar.png';
	let selectedModal: ModalState | null = null;
	let savedValue: unknown;
	let dragValue: unknown;

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
					key: 'imageSrc',
					description: 'Image source',
					typeName: 'asset',
					rowHeight: 56,
					fieldSchema,
					group: 'source',
				}}
				propStatus={{
					status: 'static',
					codeValue: url,
					keyframeDisplayOffsetAdjustment: null,
				}}
				effectiveValue={url}
				onSave={(value) => {
					savedValue = value;
					return Promise.resolve();
				}}
				onDragValueChange={(value) => {
					dragValue = value;
				}}
				onDragEnd={() => undefined}
			/>
		</SetSelectedModalContext.Provider>,
	);

	const sourceButtons = screen.getAllByRole('button', {
		name: 'Replace avatar.png',
	});
	expect(sourceButtons).toHaveLength(1);
	expect(document.querySelector('img')?.getAttribute('src')).toBe(
		'https://cdn.example.com/images/avatar.png',
	);
	fireEvent.click(sourceButtons[0]);

	const modal = selectedModal as ModalState | null;
	if (modal?.type !== 'asset-selection' || modal.assetType !== 'image') {
		throw new Error('Expected image asset selector to open');
	}

	cleanup();
	render(
		<SetSelectedModalContext.Provider
			value={{
				setSelectedModal: (update) => {
					selectedModal =
						typeof update === 'function' ? update(selectedModal) : update;
				},
			}}
		>
			<AssetSelectorModal readOnlyStudio={false} state={modal} />
		</SetSelectedModalContext.Provider>,
	);

	expect(
		screen.getByRole('button', {name: 'URL'}).getAttribute('aria-pressed'),
	).toBe('true');
	const input = screen.getByLabelText('Image URL') as HTMLInputElement;
	expect(input.value).toBe(url);
	const replacement = '//cdn.example.com/images/new-avatar.png';
	fireEvent.change(input, {target: {value: replacement}});
	fireEvent.click(screen.getByRole('button', {name: 'Replace image'}));
	expect(dragValue).toBe(replacement);
	expect(savedValue).toBe(replacement);
	expect(selectedModal).toBeNull();
});

test('a local image preview supports navigation and asset actions', async () => {
	const fieldSchema = {
		type: 'asset',
		assetType: 'image',
		default: undefined,
	} satisfies AssetFieldSchema;
	let navigationCount = 0;

	render(
		<AssetSelectionContext.Provider
			value={{
				getSourceAction: () => ({
					children: 'logo.png',
					disabled: false,
					onClick: () => {
						navigationCount++;
					},
					title: 'images/logo.png',
				}),
				sourceAction: null,
			}}
		>
			<TimelineAssetField
				field={{
					key: 'imageSrc',
					description: 'Image source',
					typeName: 'asset',
					rowHeight: 56,
					fieldSchema,
					group: 'source',
				}}
				propStatus={{
					status: 'static',
					codeValue: 'remotion-file:images/logo.png',
					keyframeDisplayOffsetAdjustment: null,
				}}
				effectiveValue="remotion-file:images/logo.png"
				onSave={() => Promise.resolve()}
				onDragValueChange={() => undefined}
				onDragEnd={() => undefined}
			/>
		</AssetSelectionContext.Provider>,
	);

	expect(screen.getByText('logo.png')).toBeTruthy();
	expect(screen.queryByText('Project asset')).toBeNull();
	expect(document.querySelector('img')?.getAttribute('draggable')).toBe(
		'false',
	);
	const previewButtons = screen.getAllByRole('button', {
		name: 'Open logo.png',
	});
	expect(previewButtons).toHaveLength(1);
	fireEvent.click(previewButtons[0]);
	expect(navigationCount).toBe(1);
	const previousMenuPortal = portals[0];
	portals[0] = document.body;
	try {
		fireEvent.contextMenu(previewButtons[0]);
		expect(await screen.findByText('Copy file name')).toBeTruthy();
	} finally {
		portals[0] = previousMenuPortal;
	}
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
