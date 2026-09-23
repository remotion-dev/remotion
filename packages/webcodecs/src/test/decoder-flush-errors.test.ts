import {afterEach, beforeEach, expect, test} from 'bun:test';
import {createAudioDecoder} from '../create-audio-decoder';
import {createVideoDecoder} from '../create-video-decoder';

type FlushBehavior = (decoder: FakeDecoder) => Promise<void>;

let flushBehavior: FlushBehavior = () => Promise.resolve();

// Bun has no WebCodecs, so the browser's decoder is replaced by a fake
// whose flush() settles the way the browser's would in each scenario.
class FakeDecoder {
	static isConfigSupported() {
		return Promise.resolve({supported: true});
	}

	state: CodecState = 'unconfigured';
	init: {error: (error: DOMException) => void};
	rejectPendingFlush: ((error: DOMException) => void) | null = null;

	constructor(init: {error: (error: DOMException) => void}) {
		this.init = init;
	}

	configure() {
		this.state = 'configured';
	}

	flush() {
		return flushBehavior(this);
	}

	reset() {
		this.rejectPendingFlush?.(
			new DOMException('Aborted due to reset()', 'AbortError'),
		);
		this.state = 'unconfigured';
	}

	close() {
		this.rejectPendingFlush?.(
			new DOMException('Aborted due to close()', 'AbortError'),
		);
		this.state = 'closed';
	}
}

const originalVideoDecoder = globalThis.VideoDecoder;
const originalAudioDecoder = globalThis.AudioDecoder;

beforeEach(() => {
	globalThis.VideoDecoder = FakeDecoder as unknown as typeof VideoDecoder;
	globalThis.AudioDecoder = FakeDecoder as unknown as typeof AudioDecoder;
});

afterEach(() => {
	globalThis.VideoDecoder = originalVideoDecoder;
	globalThis.AudioDecoder = originalAudioDecoder;
});

const cases: {
	name: string;
	flush: FlushBehavior;
	resetDuringFlush: boolean;
	expectedErrors: string[];
}[] = [
	{
		name: 'reports a flush failure to onError',
		flush: () =>
			Promise.reject(new DOMException('Flush failed', 'OperationError')),
		resetDuringFlush: false,
		expectedErrors: ['OperationError: Flush failed'],
	},
	{
		name: 'ignores Firefox "Decoder must be configured first"',
		flush: () =>
			Promise.reject(
				new DOMException(
					'Decoder must be configured first',
					'InvalidStateError',
				),
			),
		resetDuringFlush: false,
		expectedErrors: [],
	},
	{
		name: 'ignores the AbortError caused by reset()',
		flush: (decoder) =>
			new Promise((_, reject) => {
				decoder.rejectPendingFlush = reject;
			}),
		resetDuringFlush: true,
		expectedErrors: [],
	},
	{
		name: 'reports a decoding error during flush only once',
		flush: (decoder) => {
			// Like browsers do, the error callback is called and the flush is rejected
			decoder.state = 'closed';
			decoder.init.error(new DOMException('Decoding error', 'EncodingError'));
			return Promise.reject(
				new DOMException('Decoding error', 'EncodingError'),
			);
		},
		resetDuringFlush: false,
		expectedErrors: ['EncodingError: Decoding error'],
	},
];

for (const kind of ['video', 'audio'] as const) {
	for (const c of cases) {
		test(`${kind} decoder ${c.name}`, async () => {
			flushBehavior = c.flush;
			const errors: Error[] = [];
			const onError = (err: Error) => {
				errors.push(err);
			};

			const decoder =
				kind === 'video'
					? await createVideoDecoder({
							track: {codec: 'avc1.64001f'},
							onFrame: () => undefined,
							onError,
						})
					: await createAudioDecoder({
							track: {codec: 'opus', sampleRate: 48000, numberOfChannels: 2},
							onFrame: () => undefined,
							onError,
						});

			const flushed = decoder.flush();
			if (c.resetDuringFlush) {
				// Let the wrapper call the browser's flush() first
				await new Promise((resolve) => {
					setTimeout(resolve, 0);
				});
				decoder.reset();
			}

			await flushed;
			// Give the rejection handler a chance to run
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			expect(errors.map((err) => `${err.name}: ${err.message}`)).toEqual(
				c.expectedErrors,
			);
		});
	}
}
