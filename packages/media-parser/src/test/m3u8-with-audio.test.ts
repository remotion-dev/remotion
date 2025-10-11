import {expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {hasBeenAborted} from '../errors';
import {parseMedia} from '../parse-media';

test(
	'parse m3u8',
	async () => {
		let lastAudioTimestamp = 0;
		let lastVideoTimestamp = 0;

		let audioSamples = 0;
		let videoSamples = 0;

		const controller = mediaParserController();

		try {
			await parseMedia({
				src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
				acknowledgeRemotionLicense: true,
				fields: {
					audioCodec: true,
					durationInSeconds: true,
				},
				logLevel: 'info',
				controller,
				onDurationInSeconds: (durationInSeconds) => {
					expect(durationInSeconds).toBe(634.567);
				},
				onAudioTrack: () => {
					return (s) => {
						if (s.decodingTimestamp < lastAudioTimestamp) {
							throw new Error('Audio timestamp is not increasing');
						}

						audioSamples += 1;
						lastAudioTimestamp = s.decodingTimestamp;
					};
				},
				onVideoTrack: () => {
					return (s) => {
						if (s.timestamp < lastVideoTimestamp) {
							throw new Error('Video timestamp is not increasing:');
						}

						if (s.decodingTimestamp === 20000000) {
							controller.abort();
						}

						videoSamples += 1;
						lastVideoTimestamp = s.decodingTimestamp;
					};
				},
			});
			throw new Error('Should have thrown');
		} catch (e) {
			if (!hasBeenAborted(e)) {
				throw e;
			}

			expect(videoSamples).toBe(601);
			expect(audioSamples).toBe(431);
		}
	},
	{
		timeout: 30000,
	},
);
