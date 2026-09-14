import {ALL_FORMATS, EncodedPacketSink, Input, UrlSource} from 'mediabunny';
import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {acquireSharedInput} from '../get-shared-input';

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
	const lease = acquireSharedInput({
		src: 'https://example.com/prefetch-failure.wav',
		credentials: undefined,
		requestInit: undefined,
		logLevel: 'error',
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
	} finally {
		lease.release();
		await Promise.resolve();
		fetchSpy.mockRestore();
	}
});
