import {exampleVideos} from '@remotion/example-videos';
import {parseMedia} from '@remotion/media-parser';
import {nodeReader} from '@remotion/media-parser/node';
import assert from 'node:assert';
import {test} from 'node:test';

const major = parseInt(process.version.split('.')[0].slice(1));
if (major > 16) {
	test('parse media', async () => {
		const result = await parseMedia({
			src: exampleVideos.stretchedVp8,
			fields: {
				durationInSeconds: true,
			},
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
		});

		assert(result.durationInSeconds === 12.043999999999999);
	});
}
