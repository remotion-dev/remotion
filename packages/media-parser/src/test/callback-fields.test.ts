import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should be able to use callback fields only', async () => {
	let assertions = 0;

	const webm = await parseMedia({
		src: exampleVideos.transparentWebm,
		onDurationInSeconds: (durationInSeconds) => {
			assertions++;
			expect(durationInSeconds).toBe(5);
		},
		onVideoCodec: (videoCodec) => {
			assertions++;
			expect(videoCodec).toBe('vp8');
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});
	expect(assertions).toBe(2);
	expect(webm).toEqual({});
});
