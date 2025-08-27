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

	let samples = 0;

	controller.seek(90);
	await parseMedia({
		src: exampleVideos.mp3Mpeg25,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		controller,
		onAudioTrack: () => {
			return (sample) => {
				if (samples === 0) {
					expect(sample.timestamp).toBe(90_000_000);
				}

				samples++;
			};
		},
	});

	expect(samples).toBe(836);
});
