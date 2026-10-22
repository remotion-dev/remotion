import {expect, test} from 'bun:test';
import {
	getCurrentAssetMediaSections,
	getCurrentAssetImageMetadataSource,
	getCurrentAssetMetadataSource,
} from '../components/CurrentAsset';
import {
	getRenamedStaticFilePath,
	getStaticFileRenameSelection,
	validateStaticFileRename,
} from '../components/NewComposition/use-rename-static-file';
import {addAssetCacheBust} from '../helpers/add-asset-cache-bust';

test('requests image metadata for image assets', () => {
	expect(getCurrentAssetImageMetadataSource('1.jpg')).toBe('/1.jpg');
	expect(getCurrentAssetImageMetadataSource('nested/file.png')).toBe(
		'/nested/file.png',
	);
	expect(getCurrentAssetImageMetadataSource('animation.gif')).toBe(
		'/animation.gif',
	);
	expect(getCurrentAssetImageMetadataSource('image.webp')).toBe('/image.webp');
});

test('does not request media metadata for image assets', () => {
	expect(getCurrentAssetMetadataSource('1.jpg')).toBe(null);
	expect(getCurrentAssetMetadataSource('nested/file.png')).toBe(null);
	expect(getCurrentAssetMetadataSource('animation.gif')).toBe(null);
});

test('does not append cache-busting parameters to blob asset URLs', () => {
	expect(
		addAssetCacheBust({
			fetchedAt: 123,
			src: 'blob:https://www.remotion.dev/asset-id',
		}),
	).toBe('blob:https://www.remotion.dev/asset-id');
	expect(addAssetCacheBust({fetchedAt: 123, src: '/asset.png'})).toBe(
		'/asset.png?date=123',
	);
	expect(addAssetCacheBust({fetchedAt: 123, src: '/asset.png?v=1'})).toBe(
		'/asset.png?v=1&date=123',
	);
});

test('requests media metadata for audio and video assets', () => {
	expect(getCurrentAssetMetadataSource('video.mp4')).toBe('/video.mp4');
	expect(getCurrentAssetMetadataSource('nested/audio.mp3')).toBe(
		'/nested/audio.mp3',
	);
});

test('formats video and audio sections for current assets', () => {
	expect(
		getCurrentAssetMediaSections({
			duration: 10,
			format: 'QuickTime / MOV',
			width: 1920,
			height: 1080,
			videoCodec: 'avc',
			audioCodec: 'aac',
			fps: 29.97002997002997,
			isHdr: false,
			sampleRate: 48000,
			hasVideoTrack: true,
			hasAudioTrack: true,
		}),
	).toEqual({
		audio: [
			{label: 'Duration', value: '00:10.00'},
			{label: 'Codec', value: 'AAC'},
			{label: 'Sample rate', value: '48000 Hz'},
		],
		video: [
			{label: 'Dimensions', value: '1920 × 1080'},
			{label: 'Frame rate', value: '29.97 FPS'},
			{label: 'Duration', value: '00:10.00'},
			{label: 'Codec', value: 'H.264'},
			{label: 'HDR', value: 'No'},
		],
	});
});

test('returns an empty audio section for videos without audio', () => {
	expect(
		getCurrentAssetMediaSections({
			duration: 10,
			format: 'MP4',
			width: 1920,
			height: 1080,
			videoCodec: 'avc',
			audioCodec: null,
			fps: 30,
			isHdr: true,
			sampleRate: null,
			hasVideoTrack: true,
			hasAudioTrack: false,
		}),
	).toEqual({
		audio: [],
		video: [
			{label: 'Dimensions', value: '1920 × 1080'},
			{label: 'Frame rate', value: '30.00 FPS'},
			{label: 'Duration', value: '00:10.00'},
			{label: 'Codec', value: 'H.264'},
			{label: 'HDR', value: 'Yes'},
		],
	});
});

test('formats audio-only assets', () => {
	expect(
		getCurrentAssetMediaSections({
			duration: 125.5,
			format: 'MP3',
			width: null,
			height: null,
			videoCodec: null,
			audioCodec: 'mp3',
			fps: null,
			isHdr: null,
			sampleRate: 44100,
			hasVideoTrack: false,
			hasAudioTrack: true,
		}),
	).toEqual({
		audio: [
			{label: 'Duration', value: '02:05.50'},
			{label: 'Codec', value: 'MP3'},
			{label: 'Sample rate', value: '44100 Hz'},
		],
		video: null,
	});
});

test('keeps renamed assets in their current folder', () => {
	expect(
		getRenamedStaticFilePath({
			relativePath: 'nested/clip.mp4',
			newName: 'renamed.mp4',
		}),
	).toBe('nested/renamed.mp4');
	expect(
		getRenamedStaticFilePath({
			relativePath: 'clip.mp4',
			newName: 'renamed.mp4',
		}),
	).toBe('renamed.mp4');
});

test('validates renamed asset names', () => {
	const staticFiles = [
		{
			name: 'nested/clip.mp4',
			src: '/nested/clip.mp4',
			sizeInBytes: 10,
			lastModified: 0,
		},
		{
			name: 'nested/existing.mp4',
			src: '/nested/existing.mp4',
			sizeInBytes: 10,
			lastModified: 0,
		},
	];

	expect(
		validateStaticFileRename({
			newName: 'existing.mp4',
			newRelativePath: 'nested/existing.mp4',
			relativePath: 'nested/clip.mp4',
			staticFiles,
		}),
	).toBe('An asset with this name already exists');
	expect(
		validateStaticFileRename({
			newName: 'renamed.mp4',
			newRelativePath: 'nested/renamed.mp4',
			relativePath: 'nested/clip.mp4',
			staticFiles,
		}),
	).toBe(null);
});

test('selects asset names without their extension for renaming', () => {
	expect(getStaticFileRenameSelection('clip.mp4')).toEqual([0, 4]);
	expect(getStaticFileRenameSelection('clip.final.mp4')).toEqual([0, 10]);
	expect(getStaticFileRenameSelection('README')).toEqual([0, 6]);
	expect(getStaticFileRenameSelection('.env')).toEqual([0, 4]);
});
