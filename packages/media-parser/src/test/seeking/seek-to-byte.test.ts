import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {hasBeenAborted} from '../../errors';
import {mediaParserController} from '../../media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('should not be able to seek to a byte too early', async () => {
	const controller = mediaParserController();

	try {
		controller._experimentalSeek({
			type: 'byte',
			byte: 5,
		});

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				dimensions: true,
			},
		});
		throw new Error('should not complete');
	} catch (err) {
		expect((err as Error).message).toBe(
			'Cannot seek to a byte that is not in the video section. Seeking to: 5, section: start: 48, end: 14282315',
		);
	}
});

test('should not be able to seek to a byte beyond the file', async () => {
	const controller = mediaParserController();

	try {
		controller._experimentalSeek({
			type: 'byte',
			byte: 1_000_000_000,
		});

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				dimensions: true,
			},
		});
		throw new Error('should not complete');
	} catch (err) {
		expect((err as Error).message).toBe(
			'Cannot seek to a byte that is not in the video section. Seeking to: 1000000000, section: start: 48, end: 14282315',
		);
	}
});

test('should  be able to seek to a valid byte', async () => {
	const controller = mediaParserController();

	try {
		controller._experimentalSeek({
			type: 'byte',
			byte: 3224491,
		});

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			fields: {
				dimensions: true,
			},
			onVideoTrack: () => {
				return (sample) => {
					expect(sample.offset).toBe(3224491);
					controller.abort();
				};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		expect(hasBeenAborted(err as Error)).toBe(true);
	}
});
