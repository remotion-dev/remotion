import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek mp3', async () => {
	const controller = mediaParserController();
	controller._experimentalSeek({
		timeInSeconds: 10,
		type: 'keyframe-before-time',
	});

	let samples = 0;

	await parseMedia({
		src: exampleVideos.mpeg1layer3,
		controller,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		onAudioTrack: () => {
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp / sample.timescale).toBe(9.978776);
					expect(sample.type).toBe('key');
					controller._experimentalSeek({
						timeInSeconds: 25,
						type: 'keyframe-before-time',
					});
				}

				if (samples === 2) {
					expect(sample.timestamp / sample.timescale).toBe(24.999184);
					controller._experimentalSeek({
						timeInSeconds: 30,
						type: 'keyframe-before-time',
					});
				}

				if (samples === 3) {
					expect(sample.timestamp / sample.timescale).toBe(29.988571);
					expect(sample.type).toBe('key');
					controller._experimentalSeek({
						timeInSeconds: 0.0,
						type: 'keyframe-before-time',
					});
				}

				if (samples === 4) {
					expect(sample.timestamp / sample.timescale).toBe(0);
					expect(sample.type).toBe('key');
					controller._experimentalSeek({
						timeInSeconds: 100,
						type: 'keyframe-before-time',
					});
				}

				if (samples === 5) {
					expect(sample.timestamp / sample.timescale).toBe(56.502857);
					expect(sample.type).toBe('key');
				}
			};
		},
	});

	expect(samples).toBe(5);
	const performedSeeks =
		controller._internals.performedSeeksSignal.getPerformedSeeks();

	expect(performedSeeks).toEqual([
		{
			from: 3903,
			to: 401666,
			type: 'user-initiated',
		},
		{
			from: 403054,
			to: 1001966,
			type: 'user-initiated',
		},
		{
			from: 1003871,
			to: 1201370,
			type: 'user-initiated',
		},
		{
			from: 1203446,
			to: 2858,
			type: 'user-initiated',
		},
		{
			from: 3903,
			to: 2262074,
			type: 'user-initiated',
		},
	]);

	const seekingHints = await controller.getSeekingHints();
	if (seekingHints?.type !== 'mp3-seeking-hints') {
		throw new Error('Invalid seeking hints');
	}

	expect(seekingHints.audioSampleMap.length).toEqual(5);
});
