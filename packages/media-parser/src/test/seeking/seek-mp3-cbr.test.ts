import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('seek mp3 cbr', async () => {
	const controller = mediaParserController();
	controller.seek(60);

	let samples = 0;

	await parseMedia({
		src: exampleVideos.music,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		onAudioTrack: () => {
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(59.95102);
					controller.seek(10000000);
				}

				if (samples === 2) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(125.048163);
				}

				if (samples === 3) {
					throw new Error(
						'Should not reach this, this should have been the last sample',
					);
				}
			};
		},
	});

	expect(samples).toBe(2);

	const [firstSeek] =
		controller._internals.performedSeeksSignal.getPerformedSeeks();
	expect(firstSeek).toEqual({
		from: 5141,
		to: 2401120,
		type: 'user-initiated',
	});
});
