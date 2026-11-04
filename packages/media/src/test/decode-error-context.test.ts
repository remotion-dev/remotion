import {InputAudioTrack, VideoSampleSink} from 'mediabunny';
import {expect, test, vi} from 'vitest';
import {makeMediaCache} from '../caches';
import {extractFrameAndAudio} from '../extract-frame-and-audio';

const params = {
	src: '/bigbuckbunny.mp4',
	sampleRate: 48000,
	timeInSeconds: 0,
	durationInSeconds: 1 / 30,
	playbackRate: 1,
	logLevel: 'error' as const,
	includeAudio: true,
	includeVideo: false,
	loop: false,
	audioStreamIndex: null,
	trimAfter: undefined,
	trimBefore: undefined,
	fps: 30,
	maxCacheSize: 1024 * 1024,
	credentials: undefined,
};

// Regression: an unsupported audio track surfaced as a video decode error.
test('identifies the audio track when audio support fails', async () => {
	const support = vi
		.spyOn(InputAudioTrack.prototype, 'canDecode')
		.mockResolvedValue(false);
	const mediaCache = makeMediaCache();
	try {
		const result = await extractFrameAndAudio({...params, mediaCache});
		expect(result.type).toBe('cannot-decode');
		if (result.type !== 'cannot-decode')
			throw new Error('Expected audio failure');
		expect(result.error.message).toContain('audio track');
		expect(result.error.message).toContain(params.src);
	} finally {
		mediaCache.dispose('error');
		support.mockRestore();
	}
});

// A supported stream can still fail while decoding packets. Keep that cause.
test('preserves a video decoder exception and the failing timestamp', async () => {
	const cause = new DOMException('Decoder allocation failed', 'EncodingError');
	const samples = vi
		.spyOn(VideoSampleSink.prototype, 'samples')
		.mockImplementation(async function* () {
			yield await Promise.reject(cause);
		});
	const mediaCache = makeMediaCache();
	try {
		const result = await extractFrameAndAudio({
			...params,
			includeVideo: true,
			includeAudio: false,
			mediaCache,
		});
		expect(result.type).toBe('cannot-decode');
		if (result.type !== 'cannot-decode')
			throw new Error('Expected video failure');
		expect(result.error.cause).toBe(cause);
		expect(result.error.message).toContain('EncodingError');
		expect(result.error.message).toContain('Decoder allocation failed');
		expect(result.error.message).toContain('at 0s');
	} finally {
		mediaCache.dispose('error');
		samples.mockRestore();
	}
});
