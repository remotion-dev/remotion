import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse flac', async () => {
	let samples = 0;
	const {
		durationInSeconds,
		tracks,
		audioCodec,
		container,
		dimensions,
		fps,
		images,
		internalStats,
		isHdr,
		keyframes,
		location,
		metadata,
		mimeType,
		videoCodec,
		name,
		rotation,
		size,
		slowDurationInSeconds,
		slowFps,
		slowKeyframes,
		slowNumberOfFrames,
		structure,
		unrotatedDimensions,
		numberOfAudioChannels,
		sampleRate,
		slowAudioBitrate,
		slowVideoBitrate,
	} = await parseMedia({
		src: exampleVideos.flac,
		reader: nodeReader,
		fields: {
			durationInSeconds: true,
			tracks: true,
			audioCodec: true,
			container: true,
			dimensions: true,
			fps: true,
			images: true,
			internalStats: true,
			isHdr: true,
			keyframes: true,
			rotation: true,
			location: true,
			metadata: true,
			mimeType: true,
			videoCodec: true,
			name: true,
			size: true,
			slowDurationInSeconds: true,
			slowFps: true,
			slowKeyframes: true,
			slowNumberOfFrames: true,
			structure: true,
			unrotatedDimensions: true,
			numberOfAudioChannels: true,
			sampleRate: true,
			slowAudioBitrate: true,
			slowVideoBitrate: true,
		},
		onAudioTrack: () => {
			return () => {
				samples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(durationInSeconds).toBe(19.714285714285715);
	expect(tracks.audioTracks).toEqual([
		{
			codec: 'flac',
			type: 'audio',
			description: new Uint8Array([
				16, 0, 16, 0, 0, 6, 45, 0, 37, 173, 10, 196, 66, 240, 0, 13, 68, 24, 85,
				22, 231, 0, 113, 139, 185, 1, 33, 54, 155, 80, 241, 191, 203, 112,
			]),
			codecPrivate: new Uint8Array([
				16, 0, 16, 0, 0, 6, 45, 0, 37, 173, 10, 196, 66, 240, 0, 13, 68, 24, 85,
				22, 231, 0, 113, 139, 185, 1, 33, 54, 155, 80, 241, 191, 203, 112,
			]),
			codecWithoutConfig: 'flac',
			numberOfChannels: 2,
			sampleRate: 44100,
			timescale: 1000000,
			trackId: 0,
			trakBox: null,
		},
	]);
	expect(samples).toBe(213);
	expect(audioCodec).toBe('flac');
	expect(container).toBe('flac');
	expect(dimensions).toBe(null);
	expect(fps).toBe(null);
	expect(images).toEqual([]);
	expect(internalStats).toEqual({
		finalCursorOffset: 1415784,
		skippedBytes: 0,
	});
	expect(isHdr).toBe(false);
	expect(keyframes).toEqual(null);
	expect(location).toBe(null);
	expect(metadata).toEqual([
		{
			key: 'vendor',
			trackId: null,
			value: 'reference libFLAC 1.3.2 20190804',
		},
		{
			key: 'title',
			trackId: null,
			value: 'The Happy Meeting',
		},
		{
			key: 'date',
			trackId: null,
			value: '2020',
		},
		{
			key: 'album',
			trackId: null,
			value: 'Samples files',
		},
		{
			key: 'artist',
			trackId: null,
			value: 'Samples Files',
		},
		{
			key: 'tracknumber',
			trackId: null,
			value: '4',
		},
		{
			key: 'genre',
			trackId: null,
			value: 'Ambient',
		},
	]);
	expect(mimeType).toBe(null);
	expect(videoCodec).toBe(null);
	expect(name).toBe('sample.flac');
	expect(rotation).toBe(0);
	expect(size).toBe(1415784);
	expect(slowDurationInSeconds).toBe(19.714285714285715);
	expect(slowFps).toBe(0);
	expect(slowKeyframes).toEqual([]);
	expect(slowNumberOfFrames).toBe(0);
	expect(structure).toEqual({
		type: 'flac',
		boxes: [
			{
				type: 'flac-header',
			},
			{
				bitsPerSample: 15,
				channels: 2,
				maximumBlockSize: 4096,
				maximumFrameSize: 9645,
				minimumBlockSize: 4096,
				minimumFrameSize: 1581,
				sampleRate: 44100,
				totalSamples: 869400,
				type: 'flac-streaminfo',
			},
			{
				fields: [
					{
						key: 'vendor',
						trackId: null,
						value: 'reference libFLAC 1.3.2 20190804',
					},
					{
						key: 'title',
						trackId: null,
						value: 'The Happy Meeting',
					},
					{
						key: 'date',
						trackId: null,
						value: '2020',
					},
					{
						key: 'album',
						trackId: null,
						value: 'Samples files',
					},
					{
						key: 'artist',
						trackId: null,
						value: 'Samples Files',
					},
					{
						key: 'tracknumber',
						trackId: null,
						value: '4',
					},
					{
						key: 'genre',
						trackId: null,
						value: 'Ambient',
					},
				],
				type: 'flac-vorbis-comment',
			},
		],
	});
	expect(unrotatedDimensions).toBe(null);
	expect(sampleRate).toBe(44100);
	expect(numberOfAudioChannels).toBe(2);
	expect(slowAudioBitrate).toBe(572430.1799075705);
	expect(slowVideoBitrate).toBe(null);
});

test('parse flac minimal seek', async () => {
	const {audioCodec, container, internalStats} = await parseMedia({
		src: exampleVideos.flac,
		reader: nodeReader,
		fields: {
			audioCodec: true,
			container: true,
			internalStats: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioCodec).toBe('flac');
	expect(container).toBe('flac');
	expect(internalStats).toEqual({
		finalCursorOffset: 42,
		skippedBytes: 1415742,
	});
});

test('parse flac get duration and metadata', async () => {
	const {audioCodec, container, internalStats, metadata} = await parseMedia({
		src: exampleVideos.flac,
		reader: nodeReader,
		fields: {
			audioCodec: true,
			container: true,
			internalStats: true,
			durationInSeconds: true,
			metadata: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioCodec).toBe('flac');
	expect(container).toBe('flac');
	expect(internalStats).toEqual({
		finalCursorOffset: 207,
		skippedBytes: 1415577,
	});
	expect(metadata.length).toEqual(7);
});
