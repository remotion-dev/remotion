import {expect, test} from 'bun:test';
import {getDuration} from '../get-duration';
import {getVideoMetadata} from '../get-video-metadata';

test('Should stream', async () => {
	const result = await getVideoMetadata(
		'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
	);
	expect(getDuration(result)).toBe(10);
});
