import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek avi', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		timeInSeconds: 10,
		type: 'keyframe-before-time',
	});

	await parseMedia({
		src: exampleVideos.avi,
		controller,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		logLevel: 'trace',
		onVideoTrack: () => {
			let samples = 0;

			return (sample) => {
				samples++;
				console.log(sample);
				if (samples === 1) {
					expect(sample.timestamp).toBe(10);
				}
			};
		},
	});
});
