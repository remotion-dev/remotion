import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('Should stream', async () => {
	const result = await parseMedia(
		'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
		{
			durationInSeconds: true,
			fps: true,
			dimensions: true,
			boxes: true,
			videoCodec: true,
		},
	);
	expect(result.durationInSeconds).toBe(10);
	// TODO: Wrong
	expect(result.fps).toBe(3.90625);
	expect(result.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(result.codec).toEqual('h264');
});
