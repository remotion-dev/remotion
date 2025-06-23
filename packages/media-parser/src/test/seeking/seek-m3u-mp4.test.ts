import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('seek m3u, only video', async () => {
	const controller = mediaParserController();

	controller.seek(4.5);
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
						expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
							4.021666666666667,
						);
						controller.seek(2);
					}

					if (samples === 1) {
						expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(1.18);
						controller.seek(2.05);
					}

					if (samples === 2) {
						expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
							2.0283333333333333,
						);
						controller.seek(2);
					}

					if (samples === 3) {
						expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(1.18);
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

	controller.seek(5.5);

	let samples = 0;

	const expectSample = (
		sample: MediaParserVideoSample | MediaParserAudioSample,
		mediaType: 'video' | 'audio',
	) => {
		if (samples === 0) {
			expect(mediaType).toBe('video');
			expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(5.165);
		}

		if (samples === 1) {
			expect(mediaType).toBe('audio');
			expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
				5.482666666666666,
			);
			controller.seek(100);
		}

		if (samples === 2) {
			expect(mediaType).toBe('video');
			expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
				9.148333333333333,
			);
			controller.seek(1);
		}

		if (samples === 3) {
			expect(mediaType).toBe('video');
			expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
				0.036666666666666674,
			);
		}

		if (samples === 4) {
			expect(mediaType).toBe('audio');
			expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
				0.9813333333333333,
			);
		}

		if (samples === 5) {
			expect(mediaType).toBe('video');
			expect(sample.decodingTimestamp / WEBCODECS_TIMESCALE).toBe(
				0.07333333333333335,
			);
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
