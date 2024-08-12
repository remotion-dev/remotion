import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Should stream ISO base media', async () => {
	let videoTracks = 0;
	let audioTracks = 0;
	let videoSamples = 0;
	let audioSamples = 0;
	const result = await parseMedia({
		src: RenderInternals.exampleVideos.iphonevideo,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			dimensions: true,
			rotation: true,
			unrotatedDimension: true,
		},
		reader: nodeReader,
		onVideoTrack: () => {
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
	});
	expect(result.dimensions).toEqual({
		width: 2160,
		height: 3840,
	});
	expect(result.durationInSeconds).toBe(12.568333333333333);
	expect(result.fps).toBe(29.99602174777881);
	expect(result.videoCodec).toBe('h265');
	expect(result.audioCodec).toBe('aac');
	expect(result.videoTracks.length).toBe(1);
	expect(result.videoTracks[0].codecString).toBe('hvc1.2.4.L150.b0');
	expect(result.rotation).toBe(-90);
	expect(result.unrotatedDimension).toEqual({
		height: 2160,
		width: 3840,
	});
	expect(videoTracks).toBe(1);
	expect(audioTracks).toBe(1);
	// TODO: Should emit a video sample
	expect(videoSamples).toBe(0);
	expect(audioSamples).toBeGreaterThan(1);
});

test('Should stream WebM with no duration', async () => {
	const result = await parseMedia({
		src: RenderInternals.exampleVideos.nofps,
		fields: {
			fps: true,
			durationInSeconds: true,
			dimensions: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
		},
		reader: nodeReader,
	});

	expect(result.durationInSeconds).toBe(6.57);
	expect(result.dimensions).toEqual({
		width: 1470,
		height: 690,
	});
	expect(result.fps).toBe(null);
	expect(result.videoCodec).toBe('vp8');
	expect(result.audioCodec).toBe(null);
	expect(result.rotation).toBe(0);
	expect(result.videoTracks.length).toBe(1);
	expect(result.videoTracks[0].codecString).toBe('vp8');
});

test('Should stream AV1', async () => {
	let videoTracks = 0;
	let videoSamples = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			boxes: true,
		},
		reader: nodeReader,
		onVideoTrack: () => {
			videoTracks++;
			return () => {
				videoSamples++;
			};
		},
	});

	expect(parsed.durationInSeconds).toBe(1);
	expect(parsed.fps).toBe(null);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('av1');
	expect(parsed.audioCodec).toBe(null);
	expect(parsed.rotation).toBe(0);
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.videoTracks[0]).toEqual({
		type: 'video',
		codecString: 'av01.0.08M.08',
		description: null,
		sampleAspectRatio: {
			denominator: 1,
			numerator: 1,
		},
		samplePositions: [],
		timescale: 1000000,
		trackId: 1,
		untransformedHeight: 1080,
		untransformedWidth: 1920,
		height: 1080,
		width: 1920,
	});
	expect(parsed.audioTracks.length).toBe(0);
	expect(videoTracks).toBe(1);
	expect(videoSamples).toBeGreaterThan(1);
});

test('Should stream corrupted video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.corrupted,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		reader: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(30.03);
	expect(parsed.fps).toBe(23.976023976023974);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codecString).toBe('avc1.640028');
	expect(parsed.rotation).toBe(0);
});

test('Should stream screen recording video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.screenrecording,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		reader: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(5.866666666666666);
	expect(parsed.fps).toBe(58.983050847457626);
	expect(parsed.dimensions).toEqual({
		height: 1766,
		width: 2874,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe(null);
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codecString).toBe('avc1.4d0033');
	expect(parsed.rotation).toBe(0);
	expect(parsed.fps).toBe(58.983050847457626);
});

test('Should stream ProRes video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.prores,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		reader: nodeReader,
	});

	expect(parsed.fps).toBe(60);
	expect(parsed.dimensions.width).toBe(1920);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.034);
	expect(parsed.videoCodec).toBe('prores');
	expect(parsed.audioCodec).toBe('aiff');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codecString).toBe('ap4h');
	expect(parsed.rotation).toBe(0);
});

test('Should stream variable fps video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.variablefps,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			unrotatedDimension: true,
			tracks: true,
			boxes: true,
		},
		reader: nodeReader,
	});

	expect(parsed.dimensions.width).toBe(1280);
	expect(parsed.dimensions.height).toBe(720);
	expect(parsed.unrotatedDimension.width).toBe(1280);
	expect(parsed.unrotatedDimension.height).toBe(720);
	expect(parsed.durationInSeconds).toBe(22.901);
	expect(parsed.videoCodec).toBe('vp8');
	expect(parsed.audioCodec).toBe('opus');
	expect(parsed.rotation).toBe(0);
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.videoTracks[0]).toEqual({
		type: 'video',
		codecString: 'vp8',
		description: null,
		sampleAspectRatio: {
			denominator: 1,
			numerator: 1,
		},
		samplePositions: [],
		timescale: 1000000,
		trackId: 2,
		untransformedHeight: 720,
		untransformedWidth: 1280,
		height: 720,
		width: 1280,
	});
	expect(parsed.audioTracks.length).toBe(1);
	expect(parsed.audioTracks[0]).toEqual({
		type: 'audio',
		codecString: 'opus',
		samplePositions: null,
		timescale: 1000000,
		trackId: 1,
	});
});

test('Should stream MKV video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.matroskaPcm16,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
		},
		reader: nodeReader,
	});

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.333);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('pcm');
	expect(parsed.rotation).toBe(0);
	expect(parsed.fps).toBe(null);
});

test('Should stream MP3 in MP4 video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.mp4withmp3,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		reader: nodeReader,
	});

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.337);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('mp3');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codecString).toBe('avc1.640020');
	expect(parsed.audioTracks.length).toEqual(1);
	expect(parsed.audioTracks[0].codecString).toBe('mp4a.6b');
	expect(parsed.rotation).toBe(0);
});

test('Should get duration of HEVC video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.iphonehevc,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			unrotatedDimension: true,
			videoCodec: true,
		},
		reader: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(3.4);
	expect(parsed.dimensions).toEqual({
		width: 1080,
		height: 1920,
	});
	expect(parsed.fps).toEqual(30);
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.rotation).toBe(-90);
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.videoTracks[0].codecString).toBe('hvc1.2.4.L120.b0');
	expect(parsed.audioTracks.length).toBe(1);
	expect(parsed.audioTracks[0].codecString).toBe('mp4a');
	expect(parsed.unrotatedDimension).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h265');
});

test('Custom DAR', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.customDar,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			dimensions: true,
			rotation: true,
			unrotatedDimension: true,
		},
		reader: nodeReader,
	});

	expect(parsed.videoTracks[0].sampleAspectRatio).toEqual({
		numerator: 56,
		denominator: 177,
	});
	expect(parsed.dimensions).toEqual({
		height: 720,
		width: 404.9717559814453,
	});
	expect(parsed.durationInSeconds).toBe(5.725);
	expect(parsed.fps).toBe(30);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codecString).toBe('avc1.64001f');
	expect(parsed.videoTracks[0].width).toBe(405);
	expect(parsed.videoTracks[0].height).toBe(720);
	expect(parsed.videoTracks[0].untransformedWidth).toBe(1280);
	expect(parsed.videoTracks[0].untransformedHeight).toBe(720);
	expect(parsed.rotation).toBe(0);
	expect(parsed.unrotatedDimension).toEqual({
		height: 720,
		width: 404.9717559814453,
	});
});
