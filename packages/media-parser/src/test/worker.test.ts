import {expect, test} from 'bun:test';
import {hasBeenAborted, IsAnImageError} from '../errors';
import {mediaParserController} from '../media-parser-controller';
import {parseMediaOnWorker} from '../parse-media-on-worker';

test('worker should work', async () => {
	const {audioCodec} = await parseMediaOnWorker({
		src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts',
		fields: {
			audioCodec: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioCodec).toBe('aac');
});

test('worker should throw error as normal', () => {
	expect(() =>
		parseMediaOnWorker({
			src: 'wrongurl',
			fields: {
				audioCodec: true,
			},
			acknowledgeRemotionLicense: true,
		}),
	).toThrow('wrongurl is not a URL');
});

test('hasBeenAborted() should still work', async () => {
	const controller = mediaParserController();

	setTimeout(() => {
		controller.abort();
	}, 100);

	try {
		await parseMediaOnWorker({
			src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts',
			fields: {
				structure: true,
			},
			controller,
			acknowledgeRemotionLicense: true,
		});
		throw new Error('Should not resolve');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}

		expect(hasBeenAborted(err)).toBe(true);
	}
});

test('Custom errors should still work', async () => {
	try {
		await parseMediaOnWorker({
			src: 'https://avatars.githubusercontent.com/u/1629785?v=4',
			fields: {
				dimensions: true,
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('Should not resolve');
	} catch (err) {
		expect(err instanceof IsAnImageError).toBe(true);
		if (err instanceof IsAnImageError) {
			expect(err.imageType).toBe('png');
		}
	}
});

test('onAudioCodec() callback should still work', async () => {
	let called = false;
	await parseMediaOnWorker({
		src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts',
		acknowledgeRemotionLicense: true,
		onAudioCodec: (audioCodec) => {
			expect(audioCodec).toBe('aac');
			called = true;
		},
	});
	expect(called).toBe(true);
});

test('should do something smart when throwing inside a callback', async () => {
	try {
		await parseMediaOnWorker({
			src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts',
			acknowledgeRemotionLicense: true,
			onAudioCodec: () => {
				throw new Error('test');
			},
		});
		throw new Error('Should not resolve');
	} catch (err) {
		expect(err instanceof Error).toBe(true);
		expect((err as Error).message).toBe('test');
	}
});

test('should get samples and be able to select stuff', async () => {
	let called = false;
	let dimensionsCalled = false;
	let samples = 0;

	const controller = mediaParserController();

	try {
		await parseMediaOnWorker({
			src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
			fields: {
				dimensions: true,
			},
			selectM3uStream: ({streams}) => {
				called = true;
				expect(streams[1].resolution?.width).toBe(1280);
				expect(streams[1].resolution?.height).toBe(720);
				return streams[1].id;
			},
			onDimensions: (dimensions) => {
				dimensionsCalled = true;
				expect(dimensions).toEqual({width: 1280, height: 720});
			},
			acknowledgeRemotionLicense: true,
			controller,
			onAudioTrack: ({track}) => {
				expect(track.trackId).toBe(257);
				return () => {
					samples++;
					if (samples === 10) {
						controller.abort();
					}
				};
			},
			onVideoTrack: ({track}) => {
				expect(track.trackId).toBe(258);
				return null;
			},
		});
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}
	}

	expect(dimensionsCalled).toBe(true);
	expect(called).toBe(true);
	expect(samples).toBe(10);
});
