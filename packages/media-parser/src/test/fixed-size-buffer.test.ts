import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';

test('use fixed size buffer', async () => {
	let samples = 0;

	await parseMedia({
		src: 'https://parser.media/video.mp4',
		useFixedSizeBuffer: 100_000_000,
		onVideoTrack: (track) => {
			return () => {
				samples++;
			};
		},
		logLevel: 'verbose',
	});
	expect(samples).toBe(1);
});
