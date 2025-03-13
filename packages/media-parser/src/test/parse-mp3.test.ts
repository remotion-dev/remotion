import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should read MP3 file', async () => {
	let samples = 0;
	const {
		tracks,
		durationInSeconds,
		audioCodec,
		container,
		dimensions,
		fps,
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
		structure,
		unrotatedDimensions,
		videoCodec,
		numberOfAudioChannels,
		sampleRate,
		slowAudioBitrate,
		slowVideoBitrate,
	} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			tracks: true,
			durationInSeconds: true,
			audioCodec: true,
			container: true,
			dimensions: true,
			fps: true,
			internalStats: true,
			isHdr: true,
			keyframes: true,
			location: true,
			metadata: true,
			mimeType: true,
			name: true,
			rotation: true,
			size: true,
			slowDurationInSeconds: true,
			slowFps: true,
			slowKeyframes: true,
			slowNumberOfFrames: true,
			structure: true,
			unrotatedDimensions: true,
			videoCodec: true,
			numberOfAudioChannels: true,
			sampleRate: true,
			slowAudioBitrate: true,
			slowVideoBitrate: true,
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
		acknowledgeRemotionLicense: true,
	});

	expect(samples).toBe(4788);
	expect(durationInSeconds).toBe(125.17877551020408);
	expect(tracks.audioTracks.length).toBe(1);
	expect(videoCodec).toBe(null);
	expect(audioCodec).toBe('mp3');
	expect(container).toBe('mp3');
	expect(dimensions).toBe(null);
	expect(fps).toBe(null);
	expect(isHdr).toBe(false);
	expect(keyframes).toBe(null);
	expect(location).toBe(null);

	expect(metadata).toEqual([
		{
			key: 'TLAN',
			trackId: null,
			value: 'eng',
		},
		{
			key: 'TIT2',
			trackId: null,
			value: 'Monkeys Spinning Monkeys',
		},
		{
			key: 'TIT3',
			trackId: null,
			value:
				'License: CC BY, https://creativecommons.org/licenses/by/4.0/deed.de',
		},
		{
			key: 'TPE1',
			trackId: null,
			value: 'Kevin MacLeod',
		},
		{
			key: 'TYER',
			trackId: null,
			value: '2014',
		},
		{
			key: 'COMM',
			trackId: null,
			value:
				'eng\u0000Loopable happy light fluffy piece with bright flutes and a bunch of pizzicato strings. You can download an <A HREF="http://store.payloadz.com/go?id=1923791">uncompressed WAV format of this piece here</A> (in a lot of tempos)!',
		},
		{
			key: 'TSRC',
			trackId: null,
			value: 'USUAN1400011',
		},
		{
			key: 'WOAR',
			trackId: null,
			value: 'https://incompetech.com',
		},
		{
			key: 'WPUB',
			trackId: null,
			value: 'https://filmmusic.io',
		},
		{
			key: 'TCOP',
			trackId: null,
			value: 'https://filmmusic.io',
		},
		{
			key: 'TCON',
			trackId: null,
			value: 'Orchestral',
		},
		{
			key: 'TCON',
			trackId: null,
			value: 'Klassik',
		},
	]);
	expect(internalStats).toEqual({
		skippedBytes: 0,
		finalCursorOffset: 5007068,
	});
	expect(mimeType).toBe(null);
	expect(name).toBe('music.mp3');
	expect(rotation).toBe(0);
	expect(size).toBe(5007068);
	expect(slowDurationInSeconds).toBe(125.17877551020408);
	expect(slowFps).toBe(0);
	expect(slowKeyframes).toEqual([]);
	expect(slowNumberOfFrames).toBe(0);
	expect(structure.boxes.length).toEqual(1);
	expect(unrotatedDimensions).toBe(null);
	expect(numberOfAudioChannels).toBe(2);
	expect(slowAudioBitrate).toBe(320000.03722862975);
	expect(slowVideoBitrate).toBe(null);
	expect(sampleRate).toBe(44100);
});

test('should read only metadata', async () => {
	const {internalStats} = await parseMedia({
		src: exampleVideos.music,
		reader: nodeReader,
		fields: {
			tracks: true,
			durationInSeconds: true,
			internalStats: true,
			metadata: true,
		},
		acknowledgeRemotionLicense: true,
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
		acknowledgeRemotionLicense: true,
	});
	expect(internalStats).toEqual({
		skippedBytes: 5007068,
		finalCursorOffset: 0,
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
		acknowledgeRemotionLicense: true,
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
			acknowledgeRemotionLicense: true,
		},
	);
	expect(slowFps).toEqual(0);
	expect(slowDurationInSeconds).toEqual(125.17877551020408);
	expect(slowNumberOfFrames).toEqual(0);
	expect(fps).toEqual(null);
});

test('should read short mp3 file', async () => {
	const {durationInSeconds} = await parseMedia({
		src: exampleVideos.shortmp3,
		reader: nodeReader,
		fields: {
			tracks: true,
			durationInSeconds: true,
		},
		onAudioTrack: () => {
			return () => {};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(durationInSeconds).toBe(0.984);
});

test('should read mpeg 1 layer 3 file and album cover', async () => {
	const {durationInSeconds, images} = await parseMedia({
		src: exampleVideos.mpeg1layer3,
		reader: nodeReader,
		fields: {
			tracks: true,
			durationInSeconds: true,
			metadata: true,
			images: true,
		},
		onAudioTrack: () => {
			return () => {};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(images.length).toBe(1);
	expect(images[0].data.length).toBe(1286);
	expect(images[0].mimeType).toBe('image/png');
	expect(images[0].description).toBe('Album cover');
	expect(durationInSeconds).toBe(56.55510204081633);
});
