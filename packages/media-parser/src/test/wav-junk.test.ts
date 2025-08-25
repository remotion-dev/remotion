import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('junk wav', async () => {
	let samples = 0;
	await parseMedia({
		src: exampleVideos.junk,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		onAudioTrack: () => {
			return () => {
				samples++;
			};
		},
	});

	expect(samples).toBe(84);
});
