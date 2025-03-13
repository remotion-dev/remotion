import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should be able to parse a WebM', async () => {
	const webm = await parseMedia({
		src: exampleVideos.transparentWebm,
		fields: {
			durationInSeconds: true,
			videoCodec: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});
	expect(webm.durationInSeconds).toBe(5);
	expect(webm.videoCodec).toBe('vp8');
});
