import {afterEach, expect, mock, test} from 'bun:test';
import {decodeImage} from '../animated-image/decode-image';

const originalImageDecoder = (globalThis as Record<string, unknown>)
	.ImageDecoder;
const originalFetch = globalThis.fetch;

afterEach(() => {
	(globalThis as Record<string, unknown>).ImageDecoder = originalImageDecoder;
	globalThis.fetch = originalFetch;
});

test('animated image cache releases evicted frames and decodes them again on seek', async () => {
	const frames: {
		timestamp: number;
		duration: number;
		close: ReturnType<typeof mock>;
	}[] = [];
	const closeDecoder = mock(() => undefined);
	class FakeImageDecoder {
		public readonly completed = Promise.resolve();
		public readonly tracks = {
			ready: Promise.resolve(),
			selectedTrack: {frameCount: 12},
		};

		public decode({frameIndex}: {frameIndex: number}) {
			const frame = {
				timestamp: frameIndex * 100_000,
				duration: 100_000,
				close: mock(() => undefined),
			};
			frames.push(frame);
			return Promise.resolve({image: frame});
		}

		public close = closeDecoder;
	}

	(globalThis as Record<string, unknown>).ImageDecoder = FakeImageDecoder;
	(globalThis as Record<string, unknown>).fetch = mock(() =>
		Promise.resolve(
			new Response('synthetic image', {
				headers: {'Content-Type': 'image/gif'},
			}),
		),
	);

	const decoder = await decodeImage({
		resolvedSrc: 'https://example.test/animated.gif',
		signal: new AbortController().signal,
		currentTime: 0,
		initialLoopBehavior: 'loop',
	});

	try {
		await decoder.getFrame(0.85, 'loop');
		expect(frames.length).toBeGreaterThan(5);
		expect(
			frames.filter((frame) => frame.close.mock.calls.length === 0),
		).toHaveLength(5);

		const originalFrame = frames.find((frame) => frame.timestamp === 100_000)!;
		expect(originalFrame.close).toHaveBeenCalledTimes(1);
		const revisited = await decoder.getFrame(0.1, 'loop');
		expect(revisited?.frame).not.toBe(originalFrame);
		expect(revisited?.frame?.timestamp).toBe(100_000);
	} finally {
		decoder.close();
	}

	for (const frame of frames) {
		expect(frame.close).toHaveBeenCalledTimes(1);
	}

	expect(closeDecoder).toHaveBeenCalledTimes(1);
});
