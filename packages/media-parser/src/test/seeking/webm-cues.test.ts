import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {fetchWebmCues} from '../../containers/webm/seek/fetch-web-cues';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('get webm cues', async () => {
	const cues = await fetchWebmCues({
		src: exampleVideos.stretchedVp8,
		// must be data in seek head + offset of seek head
		position: 0x0000c9581a,
		controller: mediaParserController(),
		readerInterface: nodeReader,
		logLevel: 'info',
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

test('should use them for seeking', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 10,
	});

	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.stretchedVp8,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			controller,
			onVideoTrack: () => {
				return (s) => {
					samples++;
					if (samples === 1) {
						expect(s.timestamp / s.timescale).toBe(9.603);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 5,
						});
					}

					if (samples === 2) {
						expect(s.timestamp / s.timescale).toBe(4.803);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 0,
						});
					}

					if (samples === 3) {
						expect(s.timestamp / s.timescale).toBe(0.003);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 5,
						});
					}

					if (samples === 4) {
						expect(s.timestamp / s.timescale).toBe(4.803);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 5,
						});
						controller.abort();
					}
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

test('should work if there are no cues', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 10,
	});

	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.unevendim,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			controller,
			onVideoTrack: () => {
				return (s) => {
					if (samples === 213) {
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 5,
						});
						expect(s.timestamp / s.timescale).toBe(7.227);
					}

					if (samples === 214) {
						expect(s.timestamp / s.timescale).toBe(3.408);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 0,
						});
					}

					if (samples === 215) {
						expect(s.timestamp / s.timescale).toBe(0);
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
