import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('Should not support H.262', async () => {
	try {
		await parseMedia({
			src: exampleVideos.h262,
			fields: {
				slowKeyframes: true,
			},
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'H.262 video stream not supported',
		);
	}
});
