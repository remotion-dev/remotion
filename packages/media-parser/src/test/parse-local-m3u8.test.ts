import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('parse local playlist', async () => {
	let samples = 0;
	await parseMedia({
		src: exampleVideos.localplaylist,
		reader: nodeReader,
		onVideoTrack: () => {
			return () => {
				samples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});
	expect(samples).toBe(253);
});
