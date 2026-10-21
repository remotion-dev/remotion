import {afterEach, beforeEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React from 'react';
import {AnimatedImage} from '../animated-image/AnimatedImage.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

// Activity cleans up effects but retains state, so an <AnimatedImage> that was
// hidden still holds the decoder it closed. Using that decoder again rejects
// with "InvalidStateError: The decoder has been closed." and cancels the
// render (#12349, fixed in #12336). These tests pin the lifecycle down without
// a browser: the decoder either answers on a live instance or is not asked.

type DecodeRecord = {
	readonly id: number;
	closed: boolean;
	decodeAfterClose: number;
	decodeCalls: number;
};

const decoders: DecodeRecord[] = [];
let nextId = 0;

class FakeImageDecoder {
	public readonly record: DecodeRecord;
	public readonly completed = Promise.resolve();
	public readonly tracks: {
		readonly ready: Promise<void>;
		readonly selectedTrack: {readonly frameCount: number};
	};

	public constructor() {
		this.record = {
			id: nextId++,
			closed: false,
			decodeAfterClose: 0,
			decodeCalls: 0,
		};
		decoders.push(this.record);
		this.tracks = {
			ready: Promise.resolve(),
			selectedTrack: {frameCount: 6},
		};
	}

	public decode({frameIndex}: {frameIndex: number}) {
		if (this.record.closed) {
			this.record.decodeAfterClose++;
			return Promise.reject(
				new DOMException('The decoder has been closed.', 'InvalidStateError'),
			);
		}

		this.record.decodeCalls++;
		return Promise.resolve({
			image: {
				timestamp: frameIndex * 40000,
				duration: 40000,
				displayWidth: 100,
				displayHeight: 100,
				close: () => undefined,
			},
		});
	}

	public close() {
		this.record.closed = true;
	}
}

const originalImageDecoder = (globalThis as Record<string, unknown>)
	.ImageDecoder;
const originalFetch = (globalThis as Record<string, unknown>).fetch;
const originalGetContext = Object.getOwnPropertyDescriptor(
	HTMLCanvasElement.prototype,
	'getContext',
);

beforeEach(() => {
	decoders.length = 0;
	nextId = 0;
	(globalThis as Record<string, unknown>).ImageDecoder = FakeImageDecoder;
	(globalThis as Record<string, unknown>).fetch = () =>
		Promise.resolve({
			body: {},
			headers: {get: () => 'image/gif'},
		});
	Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
		configurable: true,
		value(this: HTMLCanvasElement, kind: string) {
			if (kind !== '2d') {
				return null;
			}

			return {
				canvas: this,
				clearRect: () => undefined,
				drawImage: () => undefined,
			} as unknown as CanvasRenderingContext2D;
		},
	});
});

afterEach(() => {
	cleanup();
	(globalThis as Record<string, unknown>).ImageDecoder = originalImageDecoder;
	(globalThis as Record<string, unknown>).fetch = originalFetch;
	if (originalGetContext) {
		Object.defineProperty(
			HTMLCanvasElement.prototype,
			'getContext',
			originalGetContext,
		);
	}
});

const flush = async () => {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
};

const App = ({
	hidden,
	frame,
}: {
	readonly hidden: boolean;
	readonly frame: number;
}) => (
	<WrapSequenceContext compositionDurationInFrames={600} currentFrame={frame}>
		<React.Activity mode={hidden ? 'hidden' : 'visible'}>
			<AnimatedImage
				src="https://example.com/animated.gif"
				width={100}
				height={100}
			/>
		</React.Activity>
	</WrapSequenceContext>
);

const expectNoClosedDecoderUse = () => {
	expect(decoders.filter((d) => d.decodeAfterClose > 0)).toHaveLength(0);
};

test('a hidden Activity leaves no closed decoder behind for the next visit', async () => {
	const view = render(<App hidden={false} frame={0} />);
	await flush();

	expect(decoders.length).toBe(1);
	expect(decoders[0].decodeCalls).toBeGreaterThan(0);

	act(() => view.rerender(<App hidden frame={0} />));
	await flush();
	// Activity cleaned the effect up, so the retained decoder is closed...
	expect(decoders[0].closed).toBe(true);

	act(() => view.rerender(<App hidden={false} frame={0} />));
	await flush();

	// ...and reappearing must not ask it to decode a frame.
	expectNoClosedDecoderUse();
	// The visit decoded again, on a decoder that was still open.
	expect(decoders.at(-1)?.decodeCalls).toBeGreaterThan(0);
	expect(decoders.at(-1)?.closed).toBe(false);
});

test('repeated hide/show cycles keep decoding on a live decoder', async () => {
	const view = render(<App hidden={false} frame={0} />);
	await flush();

	for (const frame of [0, 10, 20]) {
		act(() => view.rerender(<App hidden frame={frame} />));
		await flush();
		act(() => view.rerender(<App hidden={false} frame={frame} />));
		await flush();
	}

	expectNoClosedDecoderUse();
	// Only the visible visit holds an open decoder.
	expect(decoders.filter((d) => !d.closed)).toHaveLength(1);
});

test('reappearing before the first decode settles still decodes on a live decoder', async () => {
	const view = render(<App hidden={false} frame={0} />);
	act(() => view.rerender(<App hidden frame={0} />));
	await flush();
	act(() => view.rerender(<App hidden={false} frame={0} />));
	await flush();

	expectNoClosedDecoderUse();
	expect(decoders.at(-1)?.decodeCalls).toBeGreaterThan(0);
});
