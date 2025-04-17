import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek-xing', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 10,
	});

	await parseMedia({
		src: exampleVideos.mp3vbr,
		reader: nodeReader,
		controller,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
		},
		onDurationInSeconds: (duration) => {
			expect(duration).toBe(31.660408163265306);
		},
		onAudioTrack: () => {
			let samples = 0;
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp / sample.timescale).toBe(21.054694);
				}
			};
		},
	});
});
