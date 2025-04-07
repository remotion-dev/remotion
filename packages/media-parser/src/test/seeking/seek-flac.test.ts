import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek flac', async () => {
	const controller = mediaParserController();
	const {slowKeyframes, slowNumberOfFrames} = await parseMedia({
		src: exampleVideos.flac,
		controller,
		fields: {
			slowKeyframes: true,
			slowNumberOfFrames: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	const seekingHints = await controller.getSeekingHints();

	console.log({slowKeyframes, slowNumberOfFrames, seekingHints});
});
