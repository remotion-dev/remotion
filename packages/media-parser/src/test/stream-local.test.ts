import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Should stream ISO base media', async () => {
	const result = await parseMedia(
		RenderInternals.exampleVideos.iphonevideo,
		{
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			boxes: true,
		},
		nodeReader,
	);
	await Bun.write('boxes.json', JSON.stringify(result.boxes));
	expect(result.durationInSeconds).toBe(12.568333333333333);
	expect(result.fps).toBe(29.99602174777881);
	expect(result.videoCodec).toBe('h265');
	expect(result.audioCodec).toBe('aac');
});

test('Should stream WebM with no duration', async () => {
	const result = await parseMedia(
		RenderInternals.exampleVideos.nofps,
		{
			fps: true,
			durationInSeconds: true,
			dimensions: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);
	expect(result.durationInSeconds).toBe(6.57);
	expect(result.dimensions).toEqual({
		width: 1470,
		height: 690,
	});
	expect(result.fps).toBeDefined();
	expect(result.videoCodec).toBe('vp8');
	expect(result.audioCodec).toBe(null);
});

test('Should stream AV1 with no duration', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.av1,
		{
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

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
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.corrupted,
		{
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

	expect(parsed.durationInSeconds).toBe(30.03);
	expect(parsed.fps).toBe(23.976023976023974);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
});

test('Should stream screen recording video', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.screenrecording,
		{
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

	expect(parsed.durationInSeconds).toBe(5.866666666666666);
	expect(parsed.fps).toBe(58.983050847457626);
	expect(parsed.dimensions).toEqual({
		height: 1766,
		width: 2874,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe(null);
});

test('Should stream ProRes video', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.prores,
		{
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

	expect(parsed.fps).toBe(60);
	expect(parsed.dimensions.width).toBe(1920);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.034);
	expect(parsed.videoCodec).toBe('prores');
	expect(parsed.audioCodec).toBe('aiff');
});

test('Should stream variable fps video', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.variablefps,
		{
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

	expect(parsed.dimensions.width).toBe(1280);
	expect(parsed.dimensions.height).toBe(720);
	expect(parsed.durationInSeconds).toBe(22.901);
	expect(parsed.videoCodec).toBe('vp8');
	expect(parsed.audioCodec).toBe('opus');
});

test('Should stream MKV video', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.matroskaPcm16,
		{
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.333);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('pcm');
});

test('Should stream MP3 in MP4 video', async () => {
	const parsed = await parseMedia(
		RenderInternals.exampleVideos.mp4withmp3,
		{
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
		},
		nodeReader,
	);

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.337);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('mp3');
});
