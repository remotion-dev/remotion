import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

test('should be able to parse aac', async () => {
	let audioSamples = 0;
	const {
		durationInSeconds,
		slowDurationInSeconds,
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
		name,
		rotation,
		size,
		slowFps,
		slowKeyframes,
		slowNumberOfFrames,
		slowStructure,
		tracks,
		unrotatedDimensions,
		videoCodec,
		numberOfAudioChannels,
		sampleRate,
		slowAudioBitrate,
		slowVideoBitrate,
	} = await parseMedia({
		src: exampleVideos.aac,
		reader: nodeReader,
		fields: {
			durationInSeconds: true,
			slowDurationInSeconds: true,
			audioCodec: true,
			container: true,
			dimensions: true,
			fps: true,
			images: true,
			internalStats: true,
			isHdr: true,
			keyframes: true,
			metadata: true,
			location: true,
			mimeType: true,
			videoCodec: true,
			name: true,
			rotation: true,
			size: true,
			slowFps: true,
			slowKeyframes: true,
			slowNumberOfFrames: true,
			slowStructure: true,
			tracks: true,
			unrotatedDimensions: true,
			numberOfAudioChannels: true,
			sampleRate: true,
			slowAudioBitrate: true,
			slowVideoBitrate: true,
		},
		onAudioTrack: ({track}) => {
			expect(track).toEqual({
				startInSeconds: 0,
				codec: 'mp4a.40.2',
				codecEnum: 'aac',
				codecData: {type: 'aac-config', data: new Uint8Array([10, 16])},
				description: new Uint8Array([10, 16]),
				numberOfChannels: 2,
				sampleRate: 44100,
				originalTimescale: 1000000,
				trackId: 0,
				type: 'audio',
				timescale: WEBCODECS_TIMESCALE,
				trackMediaTimeOffsetInTrackTimescale: 0,
			});
			return () => {
				audioSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioSamples).toBe(4557);
	expect(durationInSeconds).toBe(null);
	expect(slowDurationInSeconds).toBe(105.81333333333333);
	expect(audioCodec).toBe('aac');
	expect(container).toBe('aac');
	expect(dimensions).toBe(null);
	expect(fps).toBe(null);
	expect(images).toEqual([]);
	expect(internalStats).toEqual({
		skippedBytes: 0,
		finalCursorOffset: 1758426,
	});
	expect(isHdr).toBe(false);
	expect(keyframes).toEqual(null);
	expect(location).toEqual(null);
	expect(metadata).toEqual([]);
	expect(mimeType).toBe(null);
	expect(name).toBe('sample3.aac');
	expect(rotation).toBe(0);
	expect(size).toBe(1758426);
	expect(slowFps).toBe(0);
	expect(slowKeyframes).toEqual([]);
	expect(slowNumberOfFrames).toEqual(0);
	expect(unrotatedDimensions).toBe(null);
	expect(videoCodec).toBe(null);
	expect(slowStructure).toEqual({
		type: 'aac',
		boxes: [],
	});
	expect(tracks.filter((t) => t.type === 'audio').length).toBe(1);
	expect(tracks.filter((t) => t.type === 'video').length).toBe(0);
	expect(numberOfAudioChannels).toBe(2);
	expect(sampleRate).toBe(44100);
	expect(slowAudioBitrate).toBe(132945.5141129032);
	expect(slowVideoBitrate).toBe(null);
});

test('should be able to get basics without parsing all', async () => {
	const audioSamples = 0;
	const {
		durationInSeconds,
		audioCodec,
		container,
		dimensions,
		fps,
		internalStats,
		name,
		rotation,
		size,
		tracks,
		unrotatedDimensions,
		videoCodec,
	} = await parseMedia({
		src: exampleVideos.aac,
		reader: nodeReader,
		fields: {
			durationInSeconds: true,
			audioCodec: true,
			container: true,
			dimensions: true,
			fps: true,
			internalStats: true,
			videoCodec: true,
			name: true,
			rotation: true,
			size: true,
			tracks: true,
			unrotatedDimensions: true,
		},
		onAudioTrack: ({track}) => {
			expect(track).toEqual({
				startInSeconds: 0,
				codec: 'mp4a.40.2',
				codecEnum: 'aac',
				codecData: {type: 'aac-config', data: new Uint8Array([10, 16])},
				description: new Uint8Array([10, 16]),
				numberOfChannels: 2,
				sampleRate: 44100,
				originalTimescale: 1000000,
				trackId: 0,
				type: 'audio',
				timescale: WEBCODECS_TIMESCALE,
				trackMediaTimeOffsetInTrackTimescale: 0,
			});
			return null;
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioSamples).toBe(0);
	expect(durationInSeconds).toBe(null);
	expect(audioCodec).toBe('aac');
	expect(container).toBe('aac');
	expect(dimensions).toBe(null);
	expect(fps).toBe(null);
	expect(internalStats).toEqual({
		finalCursorOffset: 31,
		skippedBytes: 1758395,
	});
	expect(name).toBe('sample3.aac');
	expect(rotation).toBe(0);
	expect(size).toBe(1758426);
	expect(unrotatedDimensions).toBe(null);
	expect(videoCodec).toBe(null);
	expect(tracks.filter((t) => t.type === 'audio').length).toBe(1);
	expect(tracks.filter((t) => t.type === 'video').length).toBe(0);
});
