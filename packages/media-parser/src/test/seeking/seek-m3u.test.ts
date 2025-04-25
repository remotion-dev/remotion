import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek m3u', async () => {
	const controller = mediaParserController();

	/* controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 4,
	}); */

	await parseMedia({
		src: exampleVideos.localplaylist,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		logLevel: 'trace',
		onVideoTrack: () => {
			return (sample) => {
				console.log(sample.dts / sample.timescale);
			};
		},
	});
});
