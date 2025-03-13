import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should be able to parse only header of MP4', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
			mimeType: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.mimeType).toBe(null);
	expect(parsed.container).toBe('mp4');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: 0,
		skippedBytes: 26358,
	});
});

test('Should be able to parse only tracks of MP4', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
			tracks: true,
			mimeType: true,
			keyframes: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.container).toBe('mp4');
	expect(parsed.mimeType).toBe(null);
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: 1621,
		skippedBytes: 24737,
	});
	expect(parsed.keyframes).toEqual([
		{
			trackId: 1,
			presentationTimeInSeconds: 0.06666666666666667,
			decodingTimeInSeconds: 0,
			positionInBytes: 1637,
			sizeInBytes: 4834,
		},
	]);
});

test('Should read the whole file', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			size: true,
			container: true,
			name: true,
			internalStats: true,
			tracks: true,
			structure: true,
		},
		onAudioTrack: () => {
			return () => {};
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.container).toBe('mp4');
	expect(parsed.internalStats).toEqual({
		finalCursorOffset: parsed.size as number,
		skippedBytes: 0,
	});
});
