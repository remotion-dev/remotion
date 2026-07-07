import {expect, test} from 'bun:test';
import {
	getCurrentAssetMediaDetailLines,
	getCurrentAssetMetadataSource,
} from '../components/CurrentAsset';
import {
	getRenamedStaticFilePath,
	getStaticFileRenameSelection,
	validateStaticFileRename,
} from '../components/NewComposition/use-rename-static-file';

test('does not request media metadata for image assets', () => {
	expect(getCurrentAssetMetadataSource('1.jpg')).toBe(null);
	expect(getCurrentAssetMetadataSource('nested/file.png')).toBe(null);
	expect(getCurrentAssetMetadataSource('animation.gif')).toBe(null);
});

test('requests media metadata for audio and video assets', () => {
	expect(getCurrentAssetMetadataSource('video.mp4')).toBe('/video.mp4');
	expect(getCurrentAssetMetadataSource('nested/audio.mp3')).toBe(
		'/nested/audio.mp3',
	);
});

test('formats multimedia details for current assets', () => {
	expect(
		getCurrentAssetMediaDetailLines({
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
	).toEqual(['Video: H.264 · 29.97 FPS · HDR: No', 'Audio: AAC · 48000 Hz']);
});

test('formats missing audio for current asset videos', () => {
	expect(
		getCurrentAssetMediaDetailLines({
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
	).toEqual(['Video: H.264 · 30.00 FPS · HDR: Yes', 'Audio: No audio']);
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
