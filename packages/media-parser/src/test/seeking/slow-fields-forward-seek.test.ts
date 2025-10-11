import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('should not calculate slow fps, slow duration, slow keyframes etc. if there was seeking inbetween', async () => {
	const controller = mediaParserController();

	controller.seek(30);

	try {
		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			fields: {
				slowDurationInSeconds: true,
				dimensions: true,
			},
			onSlowFps: () => undefined,
			acknowledgeRemotionLicense: true,
			onVideoTrack: () => {
				return () => {};
			},
		});
		throw new Error('should not get this far');
	} catch (error) {
		expect((error as Error).message).toInclude(
			`Forward seeking is not allowed when the following fields are requested from parseMedia(): slowDurationInSeconds, slowFps. Seek was from 0x3ba to 0x480672. Either don't seek forward, or don't request these fields.`,
		);
	}
});
