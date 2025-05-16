import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {SeekingHints} from '../../seeking-hints';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

const expectedSeekingHints: SeekingHints = {
	type: 'riff-seeking-hints',
	hasIndex: false,
	idx1Entries: null,
	samplesPerSecond: 30,
	moviOffset: 9984,
	observedKeyframes: [
		{
			trackId: 0,
			decodingTimeInSeconds: 0,
			positionInBytes: 9984,
			presentationTimeInSeconds: 0,
			sizeInBytes: 4599,
			sampleCounts: {'0': 0},
		},
		{
			trackId: 0,
			decodingTimeInSeconds: 8.333333333333334,
			positionInBytes: 203298,
			presentationTimeInSeconds: 8.333333333333334,
			sizeInBytes: 4796,
			sampleCounts: {'0': 250, '1': 782},
		},
	],
};

test('seek avi', async () => {
	const controller = mediaParserController();

	controller.seek(10);

	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.aviWithoutIdx,
			controller,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			onVideoTrack: () => {
				return (sample) => {
					samples++;
					if (samples === 1) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(0);
						expect(sample.type).toBe('key');
						controller.seek(20);
					}

					if (samples === 2) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(0);
						expect(sample.type).toBe('key');
					}

					if (samples === 300) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(9.9);
						expect(sample.type).toBe('delta');

						controller.seek(10);
					}

					if (samples === 301) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
							8.333333333333334,
						);
						expect(sample.type).toBe('key');
					}

					if (samples === 302) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
							8.466666666666667,
						);
						expect(sample.type).toBe('delta');
						controller.abort();
					}
				};
			},
		});
		throw new Error('Should not happen');
	} catch (error) {
		if (!hasBeenAborted(error)) {
			throw error;
		}
	}

	expect(samples).toBe(302);

	const performedSeeks =
		controller._internals.performedSeeksSignal.getPerformedSeeks();

	expect(performedSeeks).toEqual([
		{
			from: 14592,
			to: 9984,
			type: 'user-initiated',
		},
		{
			from: 14592,
			to: 9984,
			type: 'user-initiated',
		},
		{
			from: 250562,
			to: 203298,
			type: 'user-initiated',
		},
	]);

	const seekingHints = await controller.getSeekingHints();
	expect(seekingHints).toEqual(expectedSeekingHints);
});

test('should be able to use seeking hints', async () => {
	const controller = mediaParserController();

	let samples = 0;
	controller.seek(10);

	await parseMedia({
		src: exampleVideos.aviWithoutIdx,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		seekingHints: expectedSeekingHints,
		onVideoTrack: () => {
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
						8.333333333333334,
					);
					expect(sample.type).toBe('key');
					controller.seek(20);
				}
			};
		},
	});
});
