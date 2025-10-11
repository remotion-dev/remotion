import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('seek aac', async () => {
	const controller = mediaParserController();
	controller.seek(3);

	await parseMedia({
		src: exampleVideos.aac,
		reader: nodeReader,
		controller,
		acknowledgeRemotionLicense: true,
		onAudioTrack: () => {
			let samples = 0;
			return (s) => {
				samples++;
				if (samples === 1) {
					expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(2.995374149659864);
					controller.seek(10);
				}

				if (samples === 2) {
					expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(9.984580498866213);
					controller.seek(5);
				}

				if (samples === 3) {
					expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(4.992290249433107);
					controller.seek(1000);
				}

				if (samples === 4) {
					expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(105.79011337868481);
				}

				if (samples === 5) {
					throw new Error('this should have been the last sample');
				}
			};
		},
	});

	const hints = await controller.getSeekingHints();
	if (!hints || hints.type !== 'aac-seeking-hints') {
		throw new Error('No hints');
	}

	expect(hints.audioSampleMap.length).toBe(4557);

	// TODO: Get seeking hints to work
	const performedSeeks =
		controller._internals.performedSeeksSignal.getPerformedSeeks();
	expect(performedSeeks).toEqual([
		{
			from: 53471,
			to: 53071,
			type: 'user-initiated',
		},
		{
			from: 171047,
			to: 170658,
			type: 'user-initiated',
		},
		{
			from: 171047,
			to: 87851,
			type: 'user-initiated',
		},
		{
			from: 1758426,
			to: 1758412,
			type: 'user-initiated',
		},
	]);
});
