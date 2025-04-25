import {exampleVideos} from '@remotion/example-videos';
import {test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek m3u, only video', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 4.5,
	});

	await parseMedia({
		src: exampleVideos.localplaylist,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		onVideoTrack: () => {
			return (sample) => {
				console.log(sample.dts / sample.timescale);
			};
		},
	});
});

test.only('seek m3u, video and audio', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 4.5,
	});

	await parseMedia({
		src: exampleVideos.localplaylist,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		onVideoTrack: () => {
			return (sample) => {
				console.log(sample.dts / sample.timescale);
			};
		},
		onAudioTrack: () => {
			return (sample) => {
				console.log(sample.dts / sample.timescale);
			};
		},
	});
});
