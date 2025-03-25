import {getRemoteExampleVideo} from '@remotion/example-videos';
import {test} from 'bun:test';
import {mediaParserController} from '../../media-parser-controller';
import {parseMedia} from '../../parse-media';
import {nodeReader} from '../../readers/from-node';

test.skip('seek moof', async () => {
	const video = await getRemoteExampleVideo('fragmentedMoofTrickyDuration');

	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time-in-seconds',
		time: 20,
	});

	await parseMedia({
		src: video,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		controller,
		fields: {
			slowKeyframes: true,
		},
		onVideoTrack: () => {
			return (sample) => {
				if (sample.cts < 10_400_000) {
					throw new Error('did not seek correctly');
				}
			};
		},
	});
});
