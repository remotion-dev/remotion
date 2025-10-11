import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should get duration of video', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.framer24fps,
		fields: {
			durationInSeconds: true,
			dimensions: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(parsed.durationInSeconds).toBe(4.167);
	expect(parsed.dimensions).toEqual({width: 1080, height: 1080});
});
