import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';

test('seek m3u, only video', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 4.5,
	});
	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.localplaylist,
			acknowledgeRemotionLicense: true,
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				return (sample) => {
					if (samples === 0) {
						expect(sample.dts / sample.timescale).toBe(4.021666666666667);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 2,
						});
					}

					if (samples === 1) {
						expect(sample.dts / sample.timescale).toBe(1.18);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 2.05,
						});
					}

					if (samples === 2) {
						expect(sample.dts / sample.timescale).toBe(2.0283333333333333);
						controller._experimentalSeek({
							type: 'keyframe-before-time',
							timeInSeconds: 2.0,
						});
					}

					if (samples === 3) {
						expect(sample.dts / sample.timescale).toBe(1.18);
						controller.abort();
					}

					samples++;
				};
			},
		});
		throw new Error('Should not happen');
	} catch (err) {
		if (hasBeenAborted(err)) {
			return;
		}
	}

	expect(samples).toBe(4);
});

test('seek m3u, video and audio', async () => {
	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time',
		timeInSeconds: 5.5,
	});

	let samples = 0;

	const expectSample = (
		sample: AudioOrVideoSample,
		mediaType: 'video' | 'audio',
	) => {
		if (samples === 0) {
			expect(mediaType).toBe('video');
			expect(sample.dts / sample.timescale).toBe(5.165);
		}

		if (samples === 1) {
			expect(mediaType).toBe('audio');
			expect(sample.dts / sample.timescale).toBe(5.482666666666666);
			controller._experimentalSeek({
				type: 'keyframe-before-time',
				timeInSeconds: 100,
			});
		}

		if (samples === 2) {
			controller.abort();
		}

		samples++;
	};

	try {
		await parseMedia({
			src: exampleVideos.localplaylist,
			acknowledgeRemotionLicense: true,
			controller,
			reader: nodeReader,
			logLevel: 'trace',
			onVideoTrack: () => {
				return (sample) => {
					expectSample(sample, 'video');
				};
			},
			onAudioTrack: () => {
				return (sample) => {
					expectSample(sample, 'audio');
				};
			},
		});
	} catch (err) {
		if (hasBeenAborted(err)) {
			return;
		}

		throw err;
	}

	expect(samples).toBe(2);
});
