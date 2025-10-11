import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {parseMedia} from '../../parse-media';
import {nodeReader} from '../../readers/from-node';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

const controller1 = mediaParserController();

beforeAll(async () => {
	await getRemoteExampleVideo('fragmentedMoofTrickyDuration');
});

test('seek moof, should make use of the mfra atom if available', async () => {
	const video = await getRemoteExampleVideo('fragmentedMoofTrickyDuration');

	controller1.seek(20);
	let samples = 0;

	try {
		await parseMedia({
			src: video,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			controller: controller1,
			fields: {
				internalStats: true,
			},
			onVideoTrack: () => {
				return (sample) => {
					samples++;

					if (samples > 3) {
						throw new Error('should not reach here');
					}

					if (sample.timestamp === 19533333.333333336) {
						expect(sample.type).toBe('key');

						controller1.seek(0);
					}

					if (sample.decodingTimestamp === 0) {
						controller1.seek(10);
					}

					if (sample.decodingTimestamp === 9700000) {
						controller1.abort();
					}
				};
			},
		});
		throw new Error('should not reach here');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}

		expect(hasBeenAborted(err)).toBe(true);
		expect(
			controller1._internals.performedSeeksSignal.getPerformedSeeks(),
		).toEqual([
			{
				from: 2052,
				to: 1214780,
				type: 'user-initiated',
			},
			{
				from: 1261511,
				to: 2052,
				type: 'user-initiated',
			},
			{
				from: 9349,
				to: 802392,
				type: 'user-initiated',
			},
		]);
		const hints = await controller1.getSeekingHints();
		if (!hints) {
			throw new Error('No hints');
		}

		if (hints.type !== 'iso-base-media-seeking-hints') {
			throw new Error('unexpected hint type');
		}

		expect(hints.moovBox.boxSize).toEqual(1236);
		expect(hints.mediaSections).toEqual([
			{
				size: 10430,
				start: 2052,
			},
			{
				size: 47147,
				start: 1215224,
			},
			{
				size: 29819,
				start: 802836,
			},
		]);
	}
});

test('should use seeking hints from previous parse', async () => {
	const controller2 = mediaParserController();
	controller2.seek(20);
	const video = await getRemoteExampleVideo('fragmentedMoofTrickyDuration');
	const hints = await controller1.getSeekingHints();

	try {
		await parseMedia({
			src: video,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			controller: controller2,
			seekingHints: hints,
			onVideoTrack: () => {
				return (sample) => {
					const timeInSeconds = sample.timestamp / WEBCODECS_TIMESCALE;
					expect(timeInSeconds).toBe(19.533333333333335);
					expect(sample.type).toBe('key');
					controller2.abort();
				};
			},
		});
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}
	}

	const performedSeeks =
		controller2._internals.performedSeeksSignal.getPerformedSeeks();
	// Wow, jumping straight ahead
	expect(performedSeeks[0]).toEqual({
		from: 2052,
		to: 1214780,
		type: 'user-initiated',
	});
});
