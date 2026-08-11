import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

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
			slowStructure: true,
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
	expect(tracks.filter((t) => t.type === 'video')).toEqual([
		{
			startInSeconds: 0,
			m3uStreamFormat: 'ts',
			type: 'video',
			codec: 'avc1.640028',
			codecData: {
				type: 'avc-sps-pps',
				data: new Uint8Array([
					1, 100, 0, 40, 255, 225, 0, 30, 103, 100, 0, 40, 172, 217, 0, 252, 31,
					249, 101, 192, 91, 129, 1, 2, 160, 0, 0, 3, 0, 42, 131, 166, 128, 1,
					227, 6, 50, 192, 1, 0, 4, 104, 234, 239, 44, 253, 248, 248, 0,
				]),
			},
			codecEnum: 'h264',
			codedHeight: 1000,
			codedWidth: 1000,
			colorSpace: {
				matrix: 'bt470bg',
				transfer: null,
				primaries: null,
				fullRange: true,
			},
			advancedColor: {
				fullRange: true,
				matrix: 'bt470bg',
				primaries: null,
				transfer: null,
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
			originalTimescale: 90000,
			trackId: 256,
			width: 1000,
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
		},
	]);
	expect(tracks.filter((t) => t.type === 'audio')).toEqual([
		{
			startInSeconds: 0,
			codec: 'mp4a.40.2',
			codecData: {type: 'aac-config', data: new Uint8Array([9, 144])},
			codecEnum: 'aac',
			description: new Uint8Array([9, 144]),
			numberOfChannels: 2,
			sampleRate: 48000,
			originalTimescale: 90000,
			trackId: 257,
			type: 'audio',
			timescale: WEBCODECS_TIMESCALE,
			trackMediaTimeOffsetInTrackTimescale: 0,
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
			averageBandwidthInBitsPerSec: 1057100,
			bandwidthInBitsPerSec: 1057100,
			codecs: ['mp4a.40.2', 'avc1.640028'],
			dimensions: {width: 1000, height: 1000},
			id: 0,
			associatedPlaylists: [],
		},
		{
			averageBandwidthInBitsPerSec: 618200,
			bandwidthInBitsPerSec: 618200,
			codecs: ['mp4a.40.2', 'avc1.640020'],
			dimensions: {width: 720, height: 720},
			id: 1,
			associatedPlaylists: [],
		},
		{
			averageBandwidthInBitsPerSec: 358600,
			bandwidthInBitsPerSec: 358600,
			codecs: ['mp4a.40.2', 'avc1.64001f'],
			dimensions: {width: 480, height: 480},
			id: 2,
			associatedPlaylists: [],
		},
		{
			averageBandwidthInBitsPerSec: 214500,
			bandwidthInBitsPerSec: 214500,
			codecs: ['mp4a.40.2', 'avc1.640015'],
			dimensions: {width: 270, height: 270},
			id: 3,
			associatedPlaylists: [],
		},
	]);
});
