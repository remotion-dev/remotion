import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('should give good error messages', async () => {
	try {
		const {audioCodec} = await parseMedia({
			src: exampleVideos.m4a,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				audioCodec: true,
				duration: true,
			},
		});
		throw new Error(`Should not happen ${audioCodec}`);
	} catch (err) {
		expect((err as Error).message).toContain(
			'Unknown field passed: duration. Available fields: audioCodec',
		);
	}
});
