import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('Fragmented MP4 with no duration metadata does not have duration', async () => {
	const result = await parseMedia({
		src: exampleVideos.fragmentedMp4WithNoDurationMetadata,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
			internalStats: true,
		},
		reader: nodeReader,
	});

	expect(result.durationInSeconds).toBe(null);
	expect(result.internalStats).toEqual({
		skippedBytes: 48225,
		finalCursorOffset: 1258,
	});
});

test('Fragmented MP4 with no duration metadata does have slow duration, and should be able to skip', async () => {
	const controller = mediaParserController();

	const result = await parseMedia({
		src: exampleVideos.fragmentedMp4WithNoDurationMetadata,
		acknowledgeRemotionLicense: true,
		fields: {
			slowDurationInSeconds: true,
			internalStats: true,
		},
		reader: nodeReader,
		controller,
	});

	expect(result.slowDurationInSeconds).toBe(3.1333333333333337);
	expect(result.internalStats).toEqual({
		skippedBytes: 39365,
		finalCursorOffset: 49483,
	});
});
