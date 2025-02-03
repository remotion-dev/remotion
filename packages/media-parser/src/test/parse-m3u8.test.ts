import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse m3u8', async () => {
	const fields = await parseMedia({
		src: exampleVideos.m3u8,
		reader: nodeReader,
		fields: {
			structure: true,
		},
		acknowledgeRemotionLicense: true,
	});
});
