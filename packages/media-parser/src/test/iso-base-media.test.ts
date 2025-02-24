import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

// bun crash
if (process.platform !== 'win32') {
	test('Should stream ISO base media', async () => {
		let videoTracks = 0;
		let audioTracks = 0;
		let videoSamples = 0;
		let audioSamples = 0;
		const result = await parseMedia({
			src: exampleVideos.iphonevideo,
			fields: {
				durationInSeconds: true,
				fps: true,
				videoCodec: true,
				audioCodec: true,
				tracks: true,
				dimensions: true,
				rotation: true,
				unrotatedDimensions: true,
				numberOfAudioChannels: true,
				sampleRate: true,
				slowVideoBitrate: true,
				slowAudioBitrate: true,
			},
			reader: nodeReader,
			onVideoTrack: ({track}) => {
				expect(track.timescale).toBe(600);
				videoTracks++;
				return () => {
					videoSamples++;
				};
			},
			onAudioTrack: () => {
				audioTracks++;
				return () => {
					audioSamples++;
				};
			},
			acknowledgeRemotionLicense: true,
		});
		expect(result.dimensions).toEqual({
			width: 2160,
			height: 3840,
		});
		expect(result.durationInSeconds).toBe(12.568333333333333);
		expect(result.fps).toBe(29.99602174777881);
		expect(result.videoCodec).toBe('h265');
		expect(result.audioCodec).toBe('aac');
		expect(result.tracks.videoTracks.length).toBe(1);
		expect(result.tracks.videoTracks[0].codec).toBe('hvc1.2.4.L150.b0');
		expect(result.rotation).toBe(-90);
		expect(result.unrotatedDimensions).toEqual({
			height: 2160,
			width: 3840,
		});
		expect(result.sampleRate).toBe(44100);
		expect(result.numberOfAudioChannels).toBe(2);
		expect(result.slowVideoBitrate).toBe(24_521_925.585937504);
		expect(result.slowAudioBitrate).toBe(163_756.20978860298);
		expect(videoTracks).toBe(1);
		expect(audioTracks).toBe(1);
		expect(videoSamples).toBe(377);
		expect(audioSamples).toBe(544);
	});

	test('Should get keyframes', async () => {
		const {slowKeyframes, internalStats} = await parseMedia({
			src: exampleVideos.iphonevideo,
			fields: {
				slowKeyframes: true,
				internalStats: true,
			},
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
		});
		expect(internalStats).toEqual({
			finalCursorOffset: 39062928,
			skippedBytes: 2070,
		});
		expect(slowKeyframes).toEqual([
			{
				decodingTimeInSeconds: 0,
				positionInBytes: 42038,
				presentationTimeInSeconds: 0,
				sizeInBytes: 600873,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 1.0333333333333334,
				positionInBytes: 3413392,
				presentationTimeInSeconds: 1.0666666666666667,
				sizeInBytes: 127982,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 2.033333333333333,
				positionInBytes: 5928534,
				presentationTimeInSeconds: 2.1333333333333333,
				sizeInBytes: 204071,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 3.1,
				positionInBytes: 9697214,
				presentationTimeInSeconds: 3.2,
				sizeInBytes: 280275,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 4.166666666666666,
				positionInBytes: 13242642,
				presentationTimeInSeconds: 4.266666666666667,
				sizeInBytes: 213213,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 5.233333333333333,
				positionInBytes: 16387233,
				presentationTimeInSeconds: 5.333333333333333,
				sizeInBytes: 250679,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 6.3,
				positionInBytes: 19862650,
				presentationTimeInSeconds: 6.4,
				sizeInBytes: 257643,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 7.366666666666667,
				positionInBytes: 23245257,
				presentationTimeInSeconds: 7.466666666666667,
				sizeInBytes: 292951,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 8.433333333333334,
				positionInBytes: 26447938,
				presentationTimeInSeconds: 8.533333333333333,
				sizeInBytes: 307158,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 9.501666666666667,
				positionInBytes: 29786012,
				presentationTimeInSeconds: 9.601666666666667,
				sizeInBytes: 250183,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 10.568333333333333,
				positionInBytes: 33215445,
				presentationTimeInSeconds: 10.668333333333335,
				sizeInBytes: 243845,
				trackId: 1,
			},
			{
				decodingTimeInSeconds: 11.635,
				positionInBytes: 36625229,
				presentationTimeInSeconds: 11.735,
				sizeInBytes: 179470,
				trackId: 1,
			},
		]);
	});
}
