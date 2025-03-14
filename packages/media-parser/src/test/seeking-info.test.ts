import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../media-parser-controller';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('getSeekingInfo', async () => {
	const controller = mediaParserController();

	try {
		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			fields: {
				seekingInfo: true,
			},
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				controller.seek({
					type: 'time-in-seconds',
					time: 10,
				});
				return () => {};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		expect((err as Error).message).toInclude('not implemented');
	}
});
