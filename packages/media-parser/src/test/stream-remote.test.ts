import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('Should stream', async () => {
	const result = await parseMedia(
		'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		{
			durationInSeconds: true,
			fps: true,
			dimensions: true,
			videoCodec: true,
		},
	);
	expect(result.durationInSeconds).toBe(10);
	expect(result.fps).toBe(60);
	expect(result.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(result.videoCodec).toEqual('h264');
});

test('Should stream from Wikipedia', async () => {
	const result = await parseMedia(
		'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm',
		{
			boxes: true,
			durationInSeconds: true,
			fps: true,
			dimensions: true,
			videoCodec: true,
		},
	);
	expect(result.durationInSeconds).toBe(634.571);
	// TODO: Not yet implemented
	expect(result.fps).toBe(null);
	expect(result.dimensions).toEqual({
		width: 1280,
		height: 720,
	});
	expect(result.videoCodec).toEqual('vp9');
});
