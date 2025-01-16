import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should get samples of HEVC video if file can only be read forward', () => {
	let videoSamples = 0;
	process.env.DISABLE_CONTENT_RANGE = 'true';
	expect(
		parseMedia({
			src: exampleVideos.iphonehevc,
			onVideoTrack: () => {
				return () => {
					videoSamples++;
				};
			},
			reader: nodeReader,
		}),
	).rejects.toThrowError(/Source does not support reading partially/);

	expect(videoSamples).toBe(0);
	process.env.DISABLE_CONTENT_RANGE = 'false';
});
