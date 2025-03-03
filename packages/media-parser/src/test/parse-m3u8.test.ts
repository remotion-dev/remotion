import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('parse m3u8', async () => {
	let audioSamples = 0;
	let videoSamples = 0;

	const {
		dimensions,
		durationInSeconds,
		tracks,
		audioCodec,
		container,
		fps,
		images,
		isHdr,
		keyframes,
		location,
		metadata,
		mimeType,
		name,
		m3uStreams,
	} = await parseMedia({
		src: 'https://stream.mux.com/MT43ye01xu1301RYUmrpNZeBf800iEWkicKdKLUtUv7TMI.m3u8',
		onAudioTrack: () => {
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: () => {
			return () => {
				videoSamples++;
			};
		},
		fields: {
			structure: true,
			durationInSeconds: true,
			dimensions: true,
			tracks: true,
			audioCodec: true,
			container: true,
			fps: true,
			images: true,
			internalStats: true,
			isHdr: true,
			keyframes: true,
			location: true,
			metadata: true,
			mimeType: true,
			name: true,
			rotation: true,
			sampleRate: true,
			videoCodec: true,
			size: true,
			numberOfAudioChannels: true,
			m3uStreams: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(durationInSeconds).toBe(5.06667);
	expect(dimensions).toEqual({
		width: 1000,
		height: 1000,
	});
	expect(tracks.videoTracks).toEqual([
		{
			type: 'video',
			codec: 'avc1.640028',
			codecPrivate: new Uint8Array([
				1, 100, 0, 40, 255, 225, 0, 30, 103, 100, 0, 40, 172, 217, 0, 252, 31,
				249, 101, 192, 91, 129, 1, 2, 160, 0, 0, 3, 0, 42, 131, 166, 128, 1,
				227, 6, 50, 192, 1, 0, 4, 104, 234, 239, 44, 253, 248, 248, 0,
			]),
			codecWithoutConfig: 'h264',
			codedHeight: 1000,
			codedWidth: 1000,
			color: {
				matrixCoefficients: 'bt470bg',
				transferCharacteristics: null,
				primaries: null,
				fullRange: true,
			},
			description: undefined,
			displayAspectHeight: 1000,
			displayAspectWidth: 1000,
			fps: null,
			height: 1000,
			rotation: 0,
			sampleAspectRatio: {
				denominator: 1,
				numerator: 1,
			},
			timescale: 90000,
			trackId: 256,
			trakBox: null,
			width: 1000,
		},
	]);
	expect(tracks.audioTracks).toEqual([
		{
			codec: 'mp4a.40.2',
			codecPrivate: new Uint8Array([9, 144]),
			codecWithoutConfig: 'aac',
			description: undefined,
			numberOfChannels: 2,
			sampleRate: 48000,
			timescale: 90000,
			trackId: 257,
			trakBox: null,
			type: 'audio',
		},
	]);
	expect(audioCodec).toBe('aac');
	expect(container).toBe('m3u8');
	expect(fps).toBe(null);
	expect(images).toEqual([]);
	// This is flaky because mux urls are dynamic
	// expect(internalStats).toEqual({
	// 	finalCursorOffset: 2235,
	// 	skippedBytes: 0,
	// });
	expect(isHdr).toBe(false);
	expect(keyframes).toEqual(null);
	expect(location).toBe(null);
	expect(metadata).toEqual([]);
	expect(mimeType).toBe('application/x-mpegURL');
	expect(name).toBe('MT43ye01xu1301RYUmrpNZeBf800iEWkicKdKLUtUv7TMI.m3u8');
	expect(audioSamples).toBe(240);
	expect(videoSamples).toBe(151);
	// url omitted, is dynamic
	expect(m3uStreams).toMatchObject([
		{
			averageBandwidth: 1057100,
			bandwidth: 1057100,
			codecs: ['mp4a.40.2', 'avc1.640028'],
			resolution: {width: 1000, height: 1000},
			id: 0,
			associatedPlaylists: [],
		},
		{
			averageBandwidth: 618200,
			bandwidth: 618200,
			codecs: ['mp4a.40.2', 'avc1.640020'],
			resolution: {width: 720, height: 720},
			id: 1,
			associatedPlaylists: [],
		},
		{
			averageBandwidth: 358600,
			bandwidth: 358600,
			codecs: ['mp4a.40.2', 'avc1.64001f'],
			resolution: {width: 480, height: 480},
			id: 2,
			associatedPlaylists: [],
		},
		{
			averageBandwidth: 214500,
			bandwidth: 214500,
			codecs: ['mp4a.40.2', 'avc1.640015'],
			resolution: {width: 270, height: 270},
			id: 3,
			associatedPlaylists: [],
		},
	]);
});
