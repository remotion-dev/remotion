import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('seek flac', async () => {
	const controller = mediaParserController();
	controller.seek(3);
	let samples = 0;

	await parseMedia({
		src: exampleVideos.flac,
		controller,
		onAudioTrack: () => {
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
						2.972154195011338,
					);
					controller.seek(5);
				}

				if (samples === 2) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
						4.922630385487528,
					);
					controller.seek(2);
				}

				if (samples === 3) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
						1.9504761904761905,
					);
					controller.seek(90);
				}

				if (samples === 4) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
						19.690521541950112,
					);
				}
			};
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	const seekingHints = await controller.getSeekingHints();
	if (seekingHints?.type !== 'flac-seeking-hints') {
		throw new Error('Invalid seeking hints');
	}

	expect(seekingHints.audioSampleMap.length).toBe(213);

	expect(samples).toBe(4);
});
