import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test.only('seek m3u, only video', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 4.5,
	});
	let samples = 0;

	await parseMedia({
		src: exampleVideos.localplaylist,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		onVideoTrack: () => {
			return (sample) => {
				console.log(sample.dts);
				if (samples === 0) {
					expect(sample.dts / sample.timescale).toBe(4.021666666666667);
					controller._experimentalSeek({
						type: 'keyframe-before-time',
						timeInSeconds: 2,
					});
				}

				if (samples === 1) {
					expect(sample.dts / sample.timescale).toBe(1.99);

					controller.abort();
				}

				samples++;
			};
		},
	});
});

test('seek m3u, video and audio', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 5.5,
	});

	let videoSamples = 0;

	await parseMedia({
		src: exampleVideos.localplaylist,
		acknowledgeRemotionLicense: true,
		controller,
		reader: nodeReader,
		onVideoTrack: () => {
			return (sample) => {
				if (videoSamples === 0) {
					expect(sample.dts / sample.timescale).toBe(5.165);
				}

				videoSamples++;
				console.log('video', sample.dts / sample.timescale);
			};
		},
		onAudioTrack: () => {
			return (sample) => {
				console.log('audio', sample.dts / sample.timescale);
			};
		},
	});
});
