import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('handle seek infinite loop better', async () => {
	const controller = mediaParserController();

	try {
		await parseMedia({
			src: exampleVideos.framer24fps,
			controller,
			reader: nodeReader,
			fields: {
				slowFps: true,
				slowDurationInSeconds: true,
				slowKeyframes: true,
			},
			onVideoTrack: () => {
				return () => {
					controller.seek(10);
				};
			},
			acknowledgeRemotionLicense: true,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Seeking infinite loop detected: Seeked to byte 0x30 10 times in a row in the last 2 seconds. Check your usage of .seek().',
		);
	}
});
