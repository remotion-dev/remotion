import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('different mp3 file with no id3 in front', async () => {
	const {slowDurationInSeconds} = await parseMedia({
		src: exampleVideos.mp3nomagicword,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		fields: {
			slowDurationInSeconds: true,
		},
	});

	expect(slowDurationInSeconds).toBe(239.0204081632653);
});
