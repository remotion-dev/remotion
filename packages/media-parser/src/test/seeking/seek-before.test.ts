import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {hasBeenAborted} from '../../errors';
import {mediaParserController} from '../../media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';

test('should be able to set the start seek', async () => {
	const controller = mediaParserController();

	let firstSample: AudioOrVideoSample | undefined;

	try {
		controller._experimentalSeek({
			type: 'time-in-seconds',
			time: 10.6,
		});

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				return (s) => {
					firstSample = s;
					controller.abort();
				};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		expect(hasBeenAborted(err)).toBe(true);
		const timeInSeconds =
			(firstSample?.timestamp ?? 0) / (firstSample?.timescale ?? 1);
		expect(timeInSeconds).toBe(10.5);
	}
});
