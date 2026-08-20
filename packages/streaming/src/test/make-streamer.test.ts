import {expect, test} from 'bun:test';
import {makeStreamPayloadMessage} from '../make-stream-payload-message';
import type {PayloadSink} from '../make-streamer';
import {makeStreamer} from '../make-streamer';

type ReceivedMessage = {
	statusType: 'success' | 'error';
	nonce: string;
	data: Uint8Array;
};

const concat = (arrays: Uint8Array[]) => {
	const total = arrays.reduce((acc, val) => acc + val.length, 0);
	const result = new Uint8Array(total);
	let offset = 0;
	for (const arr of arrays) {
		result.set(arr, offset);
		offset += arr.length;
	}

	return result;
};

const splitIntoPieces = (data: Uint8Array, pieceSize: number) => {
	const pieces: Uint8Array[] = [];
	for (let i = 0; i < data.length; i += pieceSize) {
		pieces.push(data.subarray(i, Math.min(i + pieceSize, data.length)));
	}

	return pieces;
};

test('should buffer messages when no payload sink is given', () => {
	const received: ReceivedMessage[] = [];
	const {onData} = makeStreamer((statusType, nonce, data) => {
		received.push({statusType, nonce, data: new Uint8Array(data)});
	});

	const body = new TextEncoder().encode('hello world');
	const wire = makeStreamPayloadMessage({nonce: '1', status: 0, body});

	for (const piece of splitIntoPieces(wire, 3)) {
		onData(piece);
	}

	expect(received.length).toBe(1);
	expect(received[0].statusType).toBe('success');
	expect(received[0].nonce).toBe('1');
	expect(new TextDecoder().decode(received[0].data)).toBe('hello world');
});

test('should stream payload into sink instead of buffering', async () => {
	const received: ReceivedMessage[] = [];
	const sinkWrites: Uint8Array[] = [];
	let sinkEnded = false;
	let sinkEndedBeforeMessage = false;
	let requestedLength: number | null = null;

	const sink: PayloadSink = {
		write: (data) => {
			sinkWrites.push(new Uint8Array(data));
		},
		end: () => {
			sinkEnded = true;
		},
	};

	const {onData} = makeStreamer(
		(statusType, nonce, data) => {
			sinkEndedBeforeMessage = sinkEnded;
			received.push({statusType, nonce, data: new Uint8Array(data)});
		},
		(_statusType, nonce, length) => {
			if (nonce !== '4') {
				return null;
			}

			requestedLength = length;
			return sink;
		},
	);

	// A large binary payload that gets a sink, followed by a JSON-ish message
	// that stays buffered
	const binaryBody = new Uint8Array(100_000).map((_, i) => i % 256);
	const jsonBody = new TextEncoder().encode('{"rendered": 5}');
	const wire = concat([
		makeStreamPayloadMessage({nonce: '4', status: 0, body: binaryBody}),
		makeStreamPayloadMessage({nonce: '1', status: 0, body: jsonBody}),
	]);

	for (const piece of splitIntoPieces(wire, 1024)) {
		await onData(piece);
	}

	expect(requestedLength as number | null).toBe(binaryBody.length);
	expect(sinkEnded).toBe(true);
	expect(concat(sinkWrites)).toEqual(binaryBody);

	expect(received.length).toBe(2);
	// The sinked message is delivered with an empty payload after the sink
	// has ended
	expect(received[0].nonce).toBe('4');
	expect(received[0].data.length).toBe(0);
	expect(sinkEndedBeforeMessage).toBe(true);
	expect(received[1].nonce).toBe('1');
	expect(new TextDecoder().decode(received[1].data)).toBe('{"rendered": 5}');
});

test('should apply backpressure from an async sink', async () => {
	const sinkWrites: Uint8Array[] = [];
	let pendingWrites = 0;
	let maxPendingWrites = 0;

	const sink: PayloadSink = {
		write: async (data) => {
			pendingWrites++;
			maxPendingWrites = Math.max(maxPendingWrites, pendingWrites);
			await new Promise((resolve) => {
				setTimeout(resolve, 1);
			});
			sinkWrites.push(new Uint8Array(data));
			pendingWrites--;
		},
		end: () => {},
	};

	const {onData} = makeStreamer(
		() => {},
		() => sink,
	);

	const body = new Uint8Array(10_000).map((_, i) => (i * 7) % 256);
	const wire = makeStreamPayloadMessage({nonce: '4', status: 0, body});

	for (const piece of splitIntoPieces(wire, 512)) {
		await onData(piece);
	}

	expect(maxPendingWrites).toBe(1);
	expect(concat(sinkWrites)).toEqual(body);
});

test('should end the active sink when cleared after an aborted stream', async () => {
	let sinkEnded = false;

	const {onData, clear} = makeStreamer(
		() => {},
		() => ({
			write: () => {},
			end: () => {
				sinkEnded = true;
			},
		}),
	);

	const body = new Uint8Array(10_000).fill(3);
	const wire = makeStreamPayloadMessage({nonce: '4', status: 0, body});

	// Deliver only part of the payload, then abort
	await onData(wire.subarray(0, 5000));
	expect(sinkEnded).toBe(false);

	clear();
	// clear() is synchronous; sink.end() is invoked best-effort
	await Promise.resolve();
	expect(sinkEnded).toBe(true);

	// After clearing, a new message must be parseable from scratch
	let received = 0;
	const fullWire = makeStreamPayloadMessage({
		nonce: '4',
		status: 0,
		body: new Uint8Array(100).fill(1),
	});
	const streamerAfterRetry = makeStreamer(
		() => {
			received++;
		},
		() => ({write: () => {}, end: () => {}}),
	);
	await streamerAfterRetry.onData(fullWire);
	expect(received).toBe(1);
});

test('should handle multiple sinked messages and messages split mid-header', async () => {
	const sinks: Record<string, Uint8Array[]> = {};
	const received: ReceivedMessage[] = [];

	const {onData} = makeStreamer(
		(statusType, nonce, data) => {
			received.push({statusType, nonce, data: new Uint8Array(data)});
		},
		(_statusType, nonce) => {
			sinks[nonce] = sinks[nonce] ?? [];
			const writes = sinks[nonce];
			return {
				write: (data) => {
					writes.push(new Uint8Array(data));
				},
				end: () => {},
			};
		},
	);

	const videoBody = new Uint8Array(5000).fill(7);
	const audioBody = new Uint8Array(3000).fill(9);
	const wire = concat([
		makeStreamPayloadMessage({nonce: '4', status: 0, body: videoBody}),
		makeStreamPayloadMessage({nonce: '5', status: 1, body: audioBody}),
	]);

	// Piece size chosen so that message boundaries fall mid-header
	for (const piece of splitIntoPieces(wire, 7)) {
		await onData(piece);
	}

	expect(concat(sinks['4'])).toEqual(videoBody);
	expect(concat(sinks['5'])).toEqual(audioBody);
	expect(received.map((r) => r.nonce)).toEqual(['4', '5']);
	expect(received[1].statusType).toBe('error');
});
