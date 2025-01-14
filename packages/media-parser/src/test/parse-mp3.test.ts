import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should read MP3 file', async () => {
	let samples = 0;
	const {tracks, durationInSeconds} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			tracks: true,
			durationInSeconds: true,
		},
		onAudioTrack: () => {
			let lastSample = -1;
			return (sample) => {
				expect(
					sample.data.byteLength === 1045 || sample.data.byteLength === 1044,
				).toBe(true);
				samples++;
				expect(sample.timestamp).toBeGreaterThan(lastSample);
				lastSample = sample.timestamp;
			};
		},
	});

	expect(samples).toBe(4788);
	expect(durationInSeconds).toBe(125.17877551020408);
	expect(tracks.audioTracks.length).toBe(1);
});

test('should read only metadata', async () => {
	const {internalStats} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			tracks: true,
			durationInSeconds: true,
			internalStats: true,
		},
	});
	expect(internalStats).toEqual({
		skippedBytes: 5001927,
		finalCursorOffset: 5141,
	});
});
test('should read only header', async () => {
	const {internalStats} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			container: true,
			internalStats: true,
		},
	});
	expect(internalStats).toEqual({
		skippedBytes: 5002972,
		finalCursorOffset: 4096,
	});
});
test('should read video fields', async () => {
	const {dimensions, fps} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			fps: true,
			dimensions: true,
		},
	});
	expect(dimensions).toEqual(null);
	expect(fps).toEqual(null);

	const {slowDurationInSeconds, slowFps, slowNumberOfFrames} = await parseMedia(
		{
			src: exampleVideos.music,
			reader: nodeReader,
			fields: {
				slowFps: true,
				slowDurationInSeconds: true,
				slowNumberOfFrames: true,
			},
		},
	);
	expect(slowFps).toEqual(0);
	expect(slowDurationInSeconds).toEqual(125.17877551020408);
	expect(slowNumberOfFrames).toEqual(0);
	expect(fps).toEqual(null);
});

test.todo('should read only metadata');
test.todo('should read ID3 tags');
test.todo('should get video track');
