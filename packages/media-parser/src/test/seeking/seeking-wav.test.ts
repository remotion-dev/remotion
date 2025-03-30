import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seeking in a wav', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time-in-seconds',
		time: 10,
	});

	let samples = 0;

	const {internalStats} = await parseMedia({
		src: exampleVideos.chirp,
		controller,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			internalStats: true,
		},
		onAudioTrack: () => {
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp).toBe(10000000);
					controller._experimentalSeek({
						type: 'keyframe-before-time-in-seconds',
						time: 0,
					});
				}

				if (samples === 2) {
					expect(sample.timestamp).toBe(0);
					controller._experimentalSeek({
						type: 'keyframe-before-time-in-seconds',
						time: 28,
					});
				}

				if (samples === 3) {
					expect(sample.timestamp).toBe(28000000);
					// out of bounds
					controller._experimentalSeek({
						type: 'keyframe-before-time-in-seconds',
						time: 40,
					});
				}

				if (samples === 4) {
					expect(sample.timestamp).toBe(29000000);
				}
			};
		},
	});

	expect(samples).toBe(4);
	expect(
		controller._internals.performedSeeksSignal.getPerformedSeeks(),
	).toEqual([
		{
			from: 44,
			to: 882044,
			type: 'user-initiated',
		},
		{
			from: 970244,
			to: 44,
			type: 'user-initiated',
		},
		{
			from: 88244,
			to: 2469644,
			type: 'user-initiated',
		},
	]);
	expect(internalStats.finalCursorOffset).toBe(2646150);
	expect(internalStats.skippedBytes).toBe(0);
});
