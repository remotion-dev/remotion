import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Should stream ISO base media', async () => {
	const result = await parseMedia({
		src: RenderInternals.exampleVideos.iphonevideo,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
		},
		readerInterface: nodeReader,
	});
	expect(result.durationInSeconds).toBe(12.568333333333333);
	expect(result.fps).toBe(29.99602174777881);
	expect(result.videoCodec).toBe('h265');
	expect(result.audioCodec).toBe('aac');
	expect(result.videoTracks.length).toBe(1);
	expect(result.videoTracks[0].codecString).toBe('hvc1.2.4.L150.b0');
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
			// TODO: Return WebM tracks
		},
		readerInterface: nodeReader,
	});
	expect(result.durationInSeconds).toBe(6.57);
	expect(result.dimensions).toEqual({
		width: 1470,
		height: 690,
	});
	expect(result.fps).toBe(null);
	expect(result.videoCodec).toBe('vp8');
	expect(result.audioCodec).toBe(null);
});

test('Should stream AV1 with no duration', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			// TODO: Return WebM tracks
		},
		readerInterface: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(1);
	expect(parsed.fps).toBe(null);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('av1');
	expect(parsed.audioCodec).toBe(null);
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
		},
		readerInterface: nodeReader,
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
		},
		readerInterface: nodeReader,
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
		},
		readerInterface: nodeReader,
	});

	expect(parsed.fps).toBe(60);
	expect(parsed.dimensions.width).toBe(1920);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.034);
	expect(parsed.videoCodec).toBe('prores');
	expect(parsed.audioCodec).toBe('aiff');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codecString).toBe('ap4h');
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
		},
		readerInterface: nodeReader,
	});

	expect(parsed.dimensions.width).toBe(1280);
	expect(parsed.dimensions.height).toBe(720);
	expect(parsed.durationInSeconds).toBe(22.901);
	expect(parsed.videoCodec).toBe('vp8');
	expect(parsed.audioCodec).toBe('opus');
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
		},
		readerInterface: nodeReader,
	});

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.333);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('pcm');
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
		},
		readerInterface: nodeReader,
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
});
