import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {WAVE_SAMPLES_PER_SECOND} from '../containers/wav/get-seeking-byte';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

test('parse full wav', async () => {
	const {
		tracks,
		audioCodec,
		container,
		dimensions,
		durationInSeconds,
		fps,
		images,
		internalStats,
		isHdr,
		keyframes,
		location,
		metadata,
		mimeType,
		name,
		rotation,
		size,
		slowDurationInSeconds,
		slowFps,
		slowKeyframes,
		slowNumberOfFrames,
		slowStructure,
		unrotatedDimensions,
		videoCodec,
		numberOfAudioChannels,
		sampleRate,
	} = await parseMedia({
		src: exampleVideos.chirp,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			tracks: true,
			audioCodec: true,
			container: true,
			dimensions: true,
			durationInSeconds: true,
			fps: true,
			images: true,
			internalStats: true,
			isHdr: true,
			keyframes: true,
			rotation: true,
			location: true,
			metadata: true,
			mimeType: true,
			name: true,
			size: true,
			slowDurationInSeconds: true,
			slowFps: true,
			slowKeyframes: true,
			slowNumberOfFrames: true,
			slowStructure: true,
			unrotatedDimensions: true,
			videoCodec: true,
			sampleRate: true,
			numberOfAudioChannels: true,
		},
	});
	expect(dimensions).toBe(null);
	expect(container).toBe('wav');
	expect(audioCodec).toBe('pcm-s16');
	expect(tracks).toEqual([
		{
			startInSeconds: 0,
			codec: 'pcm-s16',
			codecData: null,
			codecEnum: 'pcm-s16',
			description: undefined,
			numberOfChannels: 1,
			sampleRate: 44100,
			originalTimescale: 1000000,
			trackId: 0,
			type: 'audio',
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
		},
	]);
	expect(durationInSeconds).toBe(30);
	expect(fps).toBe(null);
	expect(images).toEqual([]);
	expect(internalStats).toEqual({
		finalCursorOffset: 2646150,
		skippedBytes: 0,
	});
	expect(isHdr).toBe(false);
	expect(keyframes).toEqual(null);
	expect(location).toBe(null);
	expect(metadata).toEqual([
		{
			key: 'ISFT',
			trackId: null,
			value: 'Lavf60.16.100 (libsndfile-1.0.31)',
		},
	]);
	expect(mimeType).toBe(null);
	expect(name).toBe('chirp.wav');
	expect(rotation).toBe(0);
	expect(size).toBe(2646150);
	expect(slowDurationInSeconds).toBe(30);
	expect(slowFps).toBe(0);
	expect(slowKeyframes).toEqual([]);
	expect(slowNumberOfFrames).toBe(0);
	expect(slowStructure).toEqual({
		boxes: [
			{
				fileSize: 2646142,
				type: 'wav-header',
			},
			{
				bitsPerSample: 16,
				blockAlign: 2,
				byteRate: 88200,
				numberOfChannels: 1,
				sampleRate: 44100,
				type: 'wav-fmt',
			},
			{
				dataSize: 2646000,
				type: 'wav-data',
			},
			{
				metadata: [
					{
						key: 'ISFT',
						trackId: null,
						value: 'Lavf60.16.100 (libsndfile-1.0.31)',
					},
				],
				type: 'wav-list',
			},
			{
				type: 'wav-id3',
			},
		],
		type: 'wav',
	});
	expect(unrotatedDimensions).toBe(null);
	expect(videoCodec).toBe(null);
	expect(numberOfAudioChannels).toBe(1);
	expect(sampleRate).toBe(44100);
});

test('should be fast to only get duration', async () => {
	const {internalStats} = await parseMedia({
		src: exampleVideos.chirp,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
			internalStats: true,
			container: true,
			size: true,
			name: true,
		},
	});
	expect(internalStats).toEqual({
		skippedBytes: 2646106,
		finalCursorOffset: 2646044,
	});
});

test('should get all samples', async () => {
	let samples = 0;
	const {internalStats} = await parseMedia({
		src: exampleVideos.chirp,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			internalStats: true,
			container: true,
			size: true,
			name: true,
			slowDurationInSeconds: true,
		},
		onAudioTrack: () => {
			return (sample) => {
				expect(
					sample.decodingTimestamp % (1_000_000 / WAVE_SAMPLES_PER_SECOND),
				).toBe(0);
				expect(sample.timestamp % (1_000_000 / WAVE_SAMPLES_PER_SECOND)).toBe(
					0,
				);
				samples++;
			};
		},
	});
	expect(samples).toBe(750);
	expect(internalStats).toEqual({
		skippedBytes: 0,
		finalCursorOffset: 2646150,
	});
});
