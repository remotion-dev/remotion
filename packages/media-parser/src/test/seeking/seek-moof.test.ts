import {getRemoteExampleVideo} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {parseMedia} from '../../parse-media';
import {nodeReader} from '../../readers/from-node';

test('seek moof', async () => {
	const video = await getRemoteExampleVideo('fragmentedMoofTrickyDuration');

	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time-in-seconds',
		time: 20,
	});

	try {
		await parseMedia({
			src: video,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			controller,
			fields: {
				slowKeyframes: true,
				internalStats: true,
			},
			onVideoTrack: () => {
				return (sample) => {
					if (sample.cts < 10_400_000) {
						throw new Error('did not seek correctly');
					}

					expect(sample.cts).toBe(19533333.333333332);
					expect(sample.type).toBe('key');
					controller.abort();
				};
			},
		});
		throw new Error('should not reach here');
	} catch (err) {
		expect(hasBeenAborted(err)).toBe(true);
		expect(
			controller._internals.performedSeeksSignal.getPerformedSeeks(),
		).toEqual([
			{
				from: 2052,
				to: 12482,
				type: 'internal',
			},
			{
				from: 12758,
				to: 25532,
				type: 'internal',
			},
			{
				from: 25976,
				to: 94095,
				type: 'internal',
			},
			{
				from: 94539,
				to: 241735,
				type: 'internal',
			},
			{
				from: 242179,
				to: 355739,
				type: 'internal',
			},
			{
				from: 356183,
				to: 490611,
				type: 'internal',
			},
			{
				from: 491227,
				to: 586370,
				type: 'internal',
			},
			{
				from: 586814,
				to: 674532,
				type: 'internal',
			},
			{
				from: 674976,
				to: 713330,
				type: 'internal',
			},
			{
				from: 713774,
				to: 771926,
				type: 'internal',
			},
			{
				from: 772226,
				to: 802392,
				type: 'internal',
			},
			{
				from: 802836,
				to: 832655,
				type: 'internal',
			},
			{
				from: 833099,
				to: 880227,
				type: 'internal',
			},
			{
				from: 880843,
				to: 914385,
				type: 'internal',
			},
			{
				from: 914805,
				to: 943825,
				type: 'internal',
			},
			{
				from: 944269,
				to: 974849,
				type: 'internal',
			},
			{
				from: 975293,
				to: 1020488,
				type: 'internal',
			},
			{
				from: 1020932,
				to: 1064325,
				type: 'internal',
			},
			{
				from: 1064649,
				to: 1094851,
				type: 'internal',
			},
			{
				from: 1095467,
				to: 1133409,
				type: 'internal',
			},
			{
				from: 1133701,
				to: 1162569,
				type: 'internal',
			},
			{
				from: 1163013,
				to: 1214780,
				type: 'internal',
			},
		]);
	}
});
