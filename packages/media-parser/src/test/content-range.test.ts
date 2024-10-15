import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should get samples of HEVC video if file can only be read forward', async () => {
	let videoSamples = 0;
	process.env.DISABLE_CONTENT_RANGE = 'true';
	await parseMedia({
		src: RenderInternals.exampleVideos.iphonehevc,
		onVideoTrack: () => {
			return () => {
				videoSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(videoSamples).toBe(102);
	process.env.DISABLE_CONTENT_RANGE = 'false';
});
