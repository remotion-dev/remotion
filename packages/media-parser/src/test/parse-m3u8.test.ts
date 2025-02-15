import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse m3u8', async () => {
	const {
		dimensions,
		durationInSeconds,
		tracks,
		audioCodec,
		container,
		fps,
		images,
		internalStats,
		isHdr,
		keyframes,
		location,
		metadata,
		mimeType,
		name,
	} = await parseMedia({
		src: exampleVideos.m3u8,
		reader: nodeReader,
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
		},
		acknowledgeRemotionLicense: true,
	});

	expect(durationInSeconds).toBe(6);
	expect(dimensions).toEqual({
		// TODO: Why not 1000x1000?
		width: 1008,
		height: 1008,
	});
	expect(tracks.videoTracks).toEqual([
		{
			type: 'video',
			codec: 'avc1.640028',
			codecPrivate: new Uint8Array([
				1, 100, 0, 40, 255, 225, 0, 30, 103, 100, 0, 40, 172, 217, 0, 252, 31,
				249, 101, 192, 91, 129, 1, 2, 160, 0, 0, 3, 0, 42, 131, 166, 128, 1,
				227, 6, 50, 192, 1, 0, 4, 104, 234, 239, 44,
			]),
			codecWithoutConfig: 'h264',
			codedHeight: 1008,
			codedWidth: 1008,
			color: {
				matrixCoefficients: 'bt470bg',
				transferCharacteristics: null,
				primaries: null,
				fullRange: true,
			},
			description: undefined,
			displayAspectHeight: 1008,
			displayAspectWidth: 1008,
			fps: null,
			height: 1008,
			rotation: 0,
			sampleAspectRatio: {
				denominator: 1,
				numerator: 1,
			},
			timescale: 90000,
			trackId: 256,
			trakBox: null,
			width: 1008,
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
	expect(internalStats).toEqual({
		finalCursorOffset: 2223,
		skippedBytes: 0,
	});
	expect(isHdr).toBe(false);
	expect(keyframes).toEqual(null);
	expect(location).toBe(null);
	expect(metadata).toEqual([]);
	expect(mimeType).toBe(null);
	expect(name).toBe('video.m3u8');
});
