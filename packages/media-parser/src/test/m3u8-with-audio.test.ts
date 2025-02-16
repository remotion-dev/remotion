import {expect, test} from 'bun:test';
import {hasBeenAborted} from '../errors';
import {mediaParserController} from '../media-parser-controller';
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
				onAudioTrack: () => {
					return (s) => {
						if (s.dts < lastAudioTimestamp) {
							throw new Error('Audio timestamp is not increasing');
						}

						audioSamples += 1;
						lastAudioTimestamp = s.dts;
					};
				},
				onVideoTrack: () => {
					return (s) => {
						if (s.timestamp < lastVideoTimestamp) {
							throw new Error('Video timestamp is not increasing:');
						}

						if (s.dts === 20000000) {
							controller.abort();
						}

						videoSamples += 1;
						lastVideoTimestamp = s.dts;
					};
				},
			});
			throw new Error('Should have thrown');
		} catch (e) {
			expect(hasBeenAborted(e)).toBe(true);
			expect(audioSamples).toBe(861);
			expect(videoSamples).toBe(1200);
		}
	},
	{
		timeout: 30000,
	},
);
