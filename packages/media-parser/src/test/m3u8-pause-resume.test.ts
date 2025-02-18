import {expect, test} from 'bun:test';
import {hasBeenAborted} from '../errors';
import {mediaParserController} from '../media-parser-controller';
import {parseMedia} from '../parse-media';

test('should correctly pause and resume m3u8', async () => {
	const controller = mediaParserController();
	let samples = 0;

	await parseMedia({
		src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		controller,
		acknowledgeRemotionLicense: true,
		onVideoTrack: () => {
			return async (sample) => {
				samples++;
				if (sample.timestamp === 21250000) {
					controller.pause();
					expect(samples).toBe(671);
					await new Promise((r) => {
						setTimeout(r, 100);
					});
					expect(samples).toBe(671);
					controller.resume();
				}

				if (sample.timestamp === 21400000) {
					controller.abort();
				}
			};
		},
	}).catch((e) => {
		if (!hasBeenAborted(e)) {
			throw e;
		}
	});
	expect(samples).toBe(685);
});
