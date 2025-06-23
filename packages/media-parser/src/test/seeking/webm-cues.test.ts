import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {fetchWebmCues} from '../../containers/webm/seek/fetch-web-cues';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('get webm cues', async () => {
	const cues = await fetchWebmCues({
		src: exampleVideos.stretchedVp8,
		// must be data in seek head + offset of seek head
		position: 0x0000c9581a,
		controller: mediaParserController(),
		readerInterface: nodeReader,
		logLevel: 'info',
		prefetchCache: new Map(),
	});

	expect(cues).toEqual([
		{
			trackId: 1,
			timeInTimescale: 3,
			clusterPositionInSegment: 4485,
			relativePosition: 10,
		},
		{
			trackId: 1,
			timeInTimescale: 4803,
			clusterPositionInSegment: 5080846,
			relativePosition: 1016,
		},
		{
			trackId: 1,
			timeInTimescale: 9603,
			clusterPositionInSegment: 10317853,
			relativePosition: 995,
		},
	]);
});

const controller1 = mediaParserController();

test('should use them for seeking', async () => {
	controller1.seek(10);

	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.stretchedVp8,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			controller: controller1,
			onVideoTrack: () => {
				return (s) => {
					samples++;
					const timeInSeconds = s.timestamp / WEBCODECS_TIMESCALE;
					if (samples === 1) {
						expect(timeInSeconds).toBe(9.603);
						controller1.seek(5);
					}

					if (samples === 2) {
						expect(timeInSeconds).toBe(4.803);
						controller1.seek(0);
					}

					if (samples === 3) {
						expect(timeInSeconds).toBe(0.003);
						controller1.seek(5);
					}

					if (samples === 4) {
						expect(timeInSeconds).toBe(4.803);
						controller1.seek(5);
						controller1.abort();
					}
				};
			},
		});
	} catch (error) {
		if (!hasBeenAborted(error)) {
			throw error;
		}
	}

	const seeks = controller1._internals.performedSeeksSignal.getPerformedSeeks();
	expect(seeks).toEqual([
		{
			from: 4552,
			to: 10317908,
			type: 'user-initiated',
		},
		{
			from: 10539613,
			to: 5080901,
			type: 'user-initiated',
		},
		{
			from: 5279894,
			to: 4540,
			type: 'user-initiated',
		},
		{
			from: 325902,
			to: 5081929,
			type: 'user-initiated',
		},
	]);
});

test('should be able to use precomputed seeking hints', async () => {
	let samples = 0;

	const controller2 = mediaParserController();
	controller2.seek(10);

	try {
		await parseMedia({
			src: exampleVideos.stretchedVp8,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			controller: controller2,
			seekingHints: await controller1.getSeekingHints(),
			onVideoTrack: () => {
				return (s) => {
					samples++;
					const timeInSeconds = s.timestamp / WEBCODECS_TIMESCALE;
					if (samples === 1) {
						expect(timeInSeconds).toBe(9.603);
						controller2.seek(5);
					}

					if (samples === 2) {
						expect(timeInSeconds).toBe(4.803);
						controller2.seek(0);
					}

					if (samples === 3) {
						expect(timeInSeconds).toBe(0.003);
						controller2.seek(5);
					}

					if (samples === 4) {
						expect(timeInSeconds).toBe(4.803);
						controller2.seek(5);
						controller2.abort();
					}
				};
			},
		});
	} catch (error) {
		if (!hasBeenAborted(error)) {
			throw error;
		}
	}

	const seeks = controller2._internals.performedSeeksSignal.getPerformedSeeks();
	expect(seeks).toEqual([
		{
			from: 4552,
			to: 10318915,
			type: 'user-initiated',
		},
		{
			from: 10539613,
			to: 5081929,
			type: 'user-initiated',
		},
		{
			from: 5279894,
			to: 4540,
			type: 'user-initiated',
		},
		{
			from: 325902,
			to: 5081929,
			type: 'user-initiated',
		},
	]);
});

test('should work if there are no cues', async () => {
	const controller = mediaParserController();
	controller.seek(10);

	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.unevendim,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			controller,
			onVideoTrack: () => {
				expect(WEBCODECS_TIMESCALE).toBe(WEBCODECS_TIMESCALE);
				return (s) => {
					if (samples === 213) {
						controller.seek(5);
						expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(7.227);
					}

					if (samples === 214) {
						expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(3.408);
						controller.seek(0);
					}

					if (samples === 215) {
						expect(s.timestamp / WEBCODECS_TIMESCALE).toBe(0);
						controller.abort();
					}

					samples++;
				};
			},
		});
	} catch (error) {
		if (!hasBeenAborted(error)) {
			throw error;
		}
	}

	const seeks = controller._internals.performedSeeksSignal.getPerformedSeeks();
	expect(seeks).toEqual([
		{
			from: 157,
			to: 145,
			type: 'user-initiated',
		},
		{
			from: 658442,
			to: 311967,
			type: 'user-initiated',
		},
		{
			from: 400111,
			to: 145,
			type: 'user-initiated',
		},
	]);
});
