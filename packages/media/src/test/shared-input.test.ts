import {ALL_FORMATS, EncodedPacketSink, Input, UrlSource} from 'mediabunny';
import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {acquireSharedInput} from '../get-shared-input';
import {makeOfflineMediaFetch} from '../offline-media-fetch';
import {makeSinks} from '../video-extraction/get-frames-since-keyframe';

test('shares a main-thread Input acquired outside @remotion/media', async () => {
	const src = 'https://example.com/shared-input.mp4';
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});
	const studioLease = Internals.globalMediaResourceManager.acquire<Input>({
		key: Internals.getMediabunnyInputResourceKey({
			src,
			credentials: null,
			requestInitFingerprint: null,
			revision: null,
		}),
		create: () => ({resource: input, dispose: () => input.dispose()}),
	});
	const mediaLease = acquireSharedInput({
		src,
		credentials: undefined,
		requestInit: undefined,
		logLevel: 'info',
	});

	expect(mediaLease.input).toBe(studioLease.resource);

	mediaLease.release();
	studioLease.release();
	await Promise.resolve();
	expect(input.disposed).toBe(true);
});

test('handles failed prefetches while still rejecting required reads', async () => {
	const src = 'https://example.com/prefetch-failure.wav';
	const bytes = new Uint8Array(32 * 1024 * 1024);
	const view = new DataView(bytes.buffer);
	bytes.set(new TextEncoder().encode('RIFF'), 0);
	view.setUint32(4, bytes.length - 8, true);
	bytes.set(new TextEncoder().encode('WAVEfmt '), 8);
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, 48000, true);
	view.setUint32(28, 96000, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	bytes.set(new TextEncoder().encode('data'), 36);
	view.setUint32(40, bytes.length - 44, true);

	let requests = 0;
	const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
		requests++;
		if (requests > 1) {
			return Promise.resolve(
				new Response(null, {status: 500, statusText: 'Fixture failure'}),
			);
		}

		return Promise.resolve(
			new Response(bytes.subarray(0, 512 * 1024), {
				status: 206,
				headers: {
					'Content-Range': `bytes 0-524287/${bytes.length}`,
					'Content-Length': '524288',
					'Content-Type': 'audio/wav',
				},
			}),
		);
	});
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
	const lease = acquireSharedInput({
		src,
		credentials: undefined,
		requestInit: undefined,
		logLevel: 'warn',
	});

	try {
		const track = await lease.input.getPrimaryAudioTrack();
		if (!track) {
			throw new Error('Expected a WAV audio track');
		}

		const sink = new EncodedPacketSink(track);
		let packet = await sink.getFirstPacket();
		let packets = 0;
		await expect(async () => {
			while (packet && packets < 200) {
				packet = await sink.getNextPacket(packet);
				packets++;
				// Let speculative reads settle while packets are still served from cache.
				await new Promise<void>((resolve) => setTimeout(resolve, 0));
			}
		}).rejects.toThrow('500 Fixture failure');
		expect(packets).toBeGreaterThan(0);
		expect(requests).toBeGreaterThan(1);
		expect(warnSpy.mock.calls.flat()).toEqual(
			expect.arrayContaining([
				`A speculative fetch for "${src}" failed:`,
				expect.any(Error),
			]),
		);
	} finally {
		lease.release();
		await Promise.resolve();
		fetchSpy.mockRestore();
		warnSpy.mockRestore();
	}
});

// PR #12021: disposing an extraction input must release its reconnect wait
// even when Mediabunny does not abort the fetch request's signal itself.
test('disposing an offline extraction input releases its wait without reconnecting', async () => {
	const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
	const fetchSpy = vi
		.spyOn(globalThis, 'fetch')
		.mockRejectedValue(new TypeError('Offline'));
	const {dispose} = Input.prototype;
	const disposeSpy = vi
		.spyOn(Input.prototype, 'dispose')
		.mockImplementation(function (this: Input) {
			expect(fetchSpy.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
			dispose.call(this);
		});
	const waits: boolean[] = [];
	const sinks = makeSinks(
		'https://example.com/offline-disposal.mp4',
		'error',
		undefined,
		undefined,
		(waiting) => waits.push(waiting),
	);
	try {
		await vi.waitFor(() => expect(waits).toEqual([true]));
		sinks.dispose();
		const result = await sinks.promise;
		expect(result.formatDetectionError?.name).toBe('InputDisposedError');
		await vi.waitFor(() => expect(waits).toEqual([true, false]));
		window.dispatchEvent(new Event('online'));
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	} finally {
		disposeSpy.mockRestore();
		sinks.dispose();
		online.mockRestore();
		fetchSpy.mockRestore();
	}
});

// PR #12021: supporting WebCodecs must not require newer AbortSignal APIs.
test('forwards request cancellation after headers without AbortSignal.any or throwIfAborted', async () => {
	const any = vi.spyOn(AbortSignal, 'any').mockImplementation(() => {
		throw new Error('AbortSignal.any is unavailable');
	});
	const throwIfAborted = vi
		.spyOn(AbortSignal.prototype, 'throwIfAborted')
		.mockImplementation(() => {
			throw new Error('AbortSignal.throwIfAborted is unavailable');
		});
	const fetchSpy = vi
		.spyOn(globalThis, 'fetch')
		.mockResolvedValue(new Response('media'));
	const caller = new AbortController();
	const recovery = makeOfflineMediaFetch(null);
	try {
		await recovery.fetchFn('https://example.com/legacy-signal.mp4', {
			signal: caller.signal,
		});
		const signal = fetchSpy.mock.calls[0][1]?.signal;
		expect(signal?.aborted).toBe(false);
		caller.abort();
		expect(signal?.aborted).toBe(true);
		recovery.dispose();
		await expect(
			recovery.fetchFn('https://example.com/disposed.mp4'),
		).rejects.toThrow();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	} finally {
		recovery.dispose();
		any.mockRestore();
		throwIfAborted.mockRestore();
		fetchSpy.mockRestore();
	}
});
