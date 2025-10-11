import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('should respect syncsafe tag sizes', async () => {
	await parseMedia({
		src: exampleVideos.syncsafe,
		reader: nodeReader,
		fields: {
			durationInSeconds: true,
		},
		acknowledgeRemotionLicense: true,
	});
});
