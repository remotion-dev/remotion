import {test} from 'bun:test';
import {streamVideo} from '../parse-video';

test('Should stream', async () => {
	await streamVideo(
		'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
	);
});
