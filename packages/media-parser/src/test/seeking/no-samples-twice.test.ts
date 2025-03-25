import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('should not count samples twice', async () => {
	const controller = mediaParserController();

	let samples = 0;

	const {slowNumberOfFrames} = await parseMedia({
		src: exampleVideos.framer24fps,
		controller,
		reader: nodeReader,
		fields: {
			slowNumberOfFrames: true,
		},
		onVideoTrack: () => {
			return () => {
				samples++;
				if (samples === 100) {
					controller._experimentalSeek({
						type: 'keyframe-before-time-in-seconds',
						time: 0,
					});
				}
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(slowNumberOfFrames).toBe(100);
	expect(samples).toBe(200);
});
