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
	}
});
