import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {MediaParserVideoSample} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('should be able to set the start seek', async () => {
	const controller = mediaParserController();

	let firstSample: MediaParserVideoSample | undefined;

	try {
		controller.seek(10.6);

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
			(firstSample?.timestamp ?? 0) / (WEBCODECS_TIMESCALE ?? 1);
		expect(timeInSeconds).toBe(10.416666666666666);
	}
});
