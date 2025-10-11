import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('empty video', async () => {
	const {durationInSeconds} = await parseMedia({
		src: exampleVideos.empty,
		fields: {
			durationInSeconds: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(durationInSeconds).toBe(null);

	const {slowDurationInSeconds} = await parseMedia({
		src: exampleVideos.empty,
		fields: {
			slowDurationInSeconds: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(slowDurationInSeconds).toBe(0);
});
