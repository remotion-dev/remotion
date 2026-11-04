import {expect, test, vi} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import type {MediaCache} from '../caches';
import {extractFrameAndAudio} from '../extract-frame-and-audio';
import {extractFrame} from '../video-extraction/extract-frame';

vi.mock('../audio-extraction/extract-audio', () => ({extractAudio: vi.fn()}));
vi.mock('../video-extraction/extract-frame', () => ({extractFrame: vi.fn()}));

const params = {
	src: 'blob:frame-cleanup',
	sampleRate: 48000,
	timeInSeconds: 0,
	durationInSeconds: 1 / 30,
	playbackRate: 1,
	logLevel: 'error' as const,
	includeAudio: true,
	includeVideo: true,
	loop: false,
	audioStreamIndex: null,
	trimAfter: undefined,
	trimBefore: undefined,
	fps: 30,
	maxCacheSize: 1024,
	credentials: undefined,
	mediaCache: {
		sinkManager: {getSink: () => Promise.resolve({formatDetectionError: null})},
	} as unknown as MediaCache,
};

// A real VideoFrame makes this a resource-ownership regression, not a close mock.
for (const outcome of [
	'success',
	'unsupported-audio',
	'rejected-audio',
	'bitmap-error',
] as const) {
	test(`releases the extracted frame after ${outcome}`, async () => {
		const frame = new VideoFrame(new Uint8Array(16), {
			format: 'RGBA',
			codedWidth: 2,
			codedHeight: 2,
			timestamp: 0,
		});
		const failure = new Error('audio extraction failed');
		vi.mocked(extractFrame).mockImplementation(async () => {
			// Ensure an audio rejection can happen before the frame arrives.
			await new Promise((resolve) => setTimeout(resolve, 10));
			return {type: 'success', frame, rotation: 0, durationInSeconds: 1};
		});
		if (outcome === 'rejected-audio') {
			vi.mocked(extractAudio).mockRejectedValue(failure);
		} else if (outcome === 'unsupported-audio') {
			vi.mocked(extractAudio).mockResolvedValue('cannot-decode');
		} else {
			vi.mocked(extractAudio).mockResolvedValue({
				data: null,
				durationInSeconds: 1,
			});
		}

		const bitmap =
			outcome === 'bitmap-error'
				? vi
						.spyOn(globalThis, 'createImageBitmap')
						.mockRejectedValue(new Error('bitmap failed'))
				: null;
		try {
			if (outcome === 'rejected-audio') {
				await expect(extractFrameAndAudio(params)).rejects.toBe(failure);
			} else if (outcome === 'bitmap-error') {
				await expect(extractFrameAndAudio(params)).rejects.toThrow(
					'bitmap failed',
				);
			} else {
				const result = await extractFrameAndAudio(params);
				expect(result.type).toBe(
					outcome === 'success' ? 'success' : 'cannot-decode',
				);
				if (result.type === 'success') result.frame?.close();
			}

			expect(() => frame.allocationSize()).toThrow();
		} finally {
			frame.close();
			bitmap?.mockRestore();
		}
	});
}
