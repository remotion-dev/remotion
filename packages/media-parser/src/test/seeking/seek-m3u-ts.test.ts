import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {parseMedia} from '../../parse-media';

test(
	'seek m3u, ts segments',
	async () => {
		const controller = mediaParserController();

		controller.seek(10.2);

		let samples = 0;

		// TODO: Annoying special case, the first sample has timestamp of 10 seconds
		// should we zero out the first sample? would require a new

		// TODO: Document this

		try {
			await parseMedia({
				src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
				acknowledgeRemotionLicense: true,
				controller,
				onVideoTrack: () => {
					return (sample) => {
						if (samples === 0) {
							expect(sample.dts / sample.timescale).toBe(10);
							expect(sample.type).toBe('key');
							controller.seek(39);
						}

						if (samples === 1) {
							expect(sample.dts / sample.timescale).toBe(30);
							expect(sample.type).toBe('key');
							controller.seek(5);
						}

						if (samples === 2) {
							expect(sample.dts / sample.timescale).toBe(10);
							expect(sample.type).toBe('key');
							controller.seek(25);
						}

						if (samples === 3) {
							expect(sample.dts / sample.timescale).toBe(20);
							expect(sample.type).toBe('key');
							controller.seek(10000);
						}

						if (samples === 4) {
							expect(sample.dts / sample.timescale).toBe(640);
							expect(sample.type).toBe('key');
							controller.abort();
						}

						samples++;
					};
				},
			});
		} catch (err) {
			expect(hasBeenAborted(err)).toBe(true);
		}
	},
	{
		timeout: 10000,
	},
);
