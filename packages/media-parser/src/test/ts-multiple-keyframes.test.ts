import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {hasBeenAborted} from '../errors';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

beforeAll(async () => {
	await getRemoteExampleVideo('tsKeyframes');
});

const controller1 = mediaParserController();

test('Should be able to seek back based on already observed keyframes', async () => {
	const keyframes = 0;
	let samples = 0;

	try {
		await parseMedia({
			src: await getRemoteExampleVideo('tsKeyframes'),
			onVideoTrack: () => {
				return (sample) => {
					samples++;
					const timeInSeconds = sample.timestamp / WEBCODECS_TIMESCALE;
					if (timeInSeconds === 5.8058) {
						controller1.seek(3);
					}

					if (samples === 176) {
						expect(timeInSeconds).toBe(2.9029);
						expect(sample.type).toBe('key');
						controller1.seek(2);
					}

					if (samples === 177) {
						expect(timeInSeconds).toBe(1.9352666666666665);
						expect(sample.type).toBe('key');
						controller1.abort();
					}
				};
			},
			controller: controller1,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
		});

		expect(keyframes).toBe(78);
	} catch (e) {
		if (!hasBeenAborted(e)) {
			throw e;
		}
	}

	const performedSeeks =
		controller1._internals.performedSeeksSignal.getPerformedSeeks();

	expect(samples).toBe(177);
	expect(performedSeeks).toEqual([
		{
			from: 1026292,
			to: 440672,
			type: 'user-initiated',
		},
		{
			from: 470940,
			to: 239136,
			type: 'user-initiated',
		},
	]);
});

test('should be able to use seeking hints from previous parse', async () => {
	const hints = await controller1.getSeekingHints();
	expect(hints?.type).toEqual('transport-stream-seeking-hints');

	const controller2 = mediaParserController();
	controller2.seek(3);

	try {
		await parseMedia({
			src: await getRemoteExampleVideo('tsKeyframes'),
			seekingHints: hints,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			controller: controller2,
			onVideoTrack: () => {
				return (sample) => {
					const timeInSeconds = sample.timestamp / WEBCODECS_TIMESCALE;
					expect(timeInSeconds).toBe(2.9029);
					expect(sample.type).toBe('key');
					controller2.abort();
				};
			},
		});

		throw new Error('should not reach here');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}
	}

	const performedSeeks =
		controller2._internals.performedSeeksSignal.getPerformedSeeks();
	expect(performedSeeks).toEqual([
		{
			from: 11092,
			to: 440672,
			type: 'user-initiated',
		},
	]);
});
