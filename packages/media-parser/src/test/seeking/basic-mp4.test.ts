import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {MediaParserVideoSample} from '../../webcodec-sample-types';

test('should process a basic seek request', async () => {
	const controller = mediaParserController();

	let firstSample: MediaParserVideoSample | undefined;

	try {
		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				controller.seek({
					type: 'keyframe-before-time',
					timeInSeconds: 10.6,
				});
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

test('should not be able to seek into a negative time', async () => {
	const controller = mediaParserController();
	controller.seek({
		type: 'keyframe-before-time',
		timeInSeconds: -1,
	});

	try {
		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				durationInSeconds: true,
			},
		});

		throw new Error('should not complete');
	} catch (err) {
		expect((err as Error).message).toBe(
			'Cannot seek to a negative time: {"type":"keyframe-before-time","timeInSeconds":-1}',
		);
	}
});
