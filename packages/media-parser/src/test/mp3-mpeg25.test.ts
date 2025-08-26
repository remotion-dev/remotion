import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('mpeg 2.5 mp3 file is parsing correctly', async () => {
	const {slowDurationInSeconds} = await parseMedia({
		src: exampleVideos.mp3Mpeg25,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		fields: {
			slowDurationInSeconds: true,
		},
	});

	expect(slowDurationInSeconds).toBe(150.336);
});

test('seeking in mpeg 2.5 mp3 should not hang', async () => {
	const controller = mediaParserController();

	controller.seek(90);
	// TODO: why is this failing with `Out of bounds access`?
	await parseMedia({
		src: exampleVideos.mp3Mpeg25,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		controller,
		onAudioTrack: () => {
			return () => {
				return () => {};
			};
		},
	});
}, 1000);
