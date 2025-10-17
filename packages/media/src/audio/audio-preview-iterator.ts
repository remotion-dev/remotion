import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';
import {roundTo4Digits} from '../helpers/round-to-4-digits';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export const makeAudioIterator = (
	audioSink: AudioBufferSink,
	startFromSecond: number,
) => {
	let destroyed = false;
	const iterator = audioSink.buffers(startFromSecond);
	const queuedAudioNodes: Set<AudioBufferSourceNode> = new Set();

	const cleanupAudioQueue = () => {
		for (const node of queuedAudioNodes) {
			node.stop();
		}

		queuedAudioNodes.clear();
	};

	let lastReturnedBuffer: WrappedAudioBuffer | null = null;
	let iteratorEnded = false;

	const getNextOrNullIfNotAvailable = async () => {
		const next = iterator.next();
		const result = await Promise.race([
			next,
			new Promise<void>((resolve) => {
				Promise.resolve().then(() => resolve());
			}),
		]);

		if (!result) {
			return {
				type: 'need-to-wait-for-it' as const,
				waitPromise: async () => {
					const res = await next;
					if (res.value) {
						lastReturnedBuffer = res.value;
					} else {
						iteratorEnded = true;
					}

					return res.value;
				},
			};
		}

		if (result.value) {
			lastReturnedBuffer = result.value;
		} else {
			iteratorEnded = true;
		}

		return {
			type: 'got-buffer-or-end' as const,
			buffer: result.value ?? null,
		};
	};

	const tryToSatisfySeek = async (
		time: number,
	): Promise<
		| {
				type: 'not-satisfied';
				reason: string;
		  }
		| {
				type: 'satisfied';
				buffer: WrappedAudioBuffer;
		  }
	> => {
		if (lastReturnedBuffer) {
			const bufferTimestamp = roundTo4Digits(lastReturnedBuffer.timestamp);
			if (roundTo4Digits(time) < bufferTimestamp) {
				return {
					type: 'not-satisfied' as const,
					reason: `iterator is too far, most recently returned ${bufferTimestamp}`,
				};
			}

			const bufferEndTimestamp = roundTo4Digits(
				lastReturnedBuffer.timestamp + lastReturnedBuffer.duration,
			);
			if (roundTo4Digits(time) > bufferEndTimestamp) {
				return {
					type: 'not-satisfied' as const,
					reason: `iterator is too far, most recently returned ${bufferEndTimestamp}`,
				};
			}

			return {
				type: 'satisfied' as const,
				buffer: lastReturnedBuffer,
			};
		}

		if (iteratorEnded) {
			if (lastReturnedBuffer) {
				return {
					type: 'satisfied' as const,
					buffer: lastReturnedBuffer,
				};
			}

			return {
				type: 'not-satisfied' as const,
				reason: 'iterator ended',
			};
		}

		while (true) {
			const buffer = await getNextOrNullIfNotAvailable();
			if (buffer.type === 'need-to-wait-for-it') {
				return {
					type: 'not-satisfied' as const,
					reason: 'iterator did not have buffer ready',
				};
			}

			if (buffer.type === 'got-buffer-or-end') {
				if (buffer.buffer === null) {
					iteratorEnded = true;
					if (lastReturnedBuffer) {
						return {
							type: 'satisfied' as const,
							buffer: lastReturnedBuffer,
						};
					}

					return {
						type: 'not-satisfied' as const,
						reason: 'iterator ended and did not have buffer ready',
					};
				}

				const bufferTimestamp = roundTo4Digits(buffer.buffer.timestamp);
				const bufferEndTimestamp = roundTo4Digits(
					buffer.buffer.timestamp + buffer.buffer.duration,
				);
				const timestamp = roundTo4Digits(time);
				if (bufferTimestamp <= timestamp && bufferEndTimestamp > timestamp) {
					return {
						type: 'satisfied' as const,
						buffer: buffer.buffer,
					};
				}

				continue;
			}

			throw new Error('Unreachable');
		}
	};

	return {
		cleanupAudioQueue,
		destroy: () => {
			cleanupAudioQueue();
			destroyed = true;
			iterator.return().catch(() => undefined);
		},
		getNext: () => {
			return iterator.next();
		},
		isDestroyed: () => {
			return destroyed;
		},
		addQueuedAudioNode: (node: AudioBufferSourceNode) => {
			queuedAudioNodes.add(node);
		},
		removeQueuedAudioNode: (node: AudioBufferSourceNode) => {
			queuedAudioNodes.delete(node);
		},
		tryToSatisfySeek,
	};
};

export type AudioIterator = ReturnType<typeof makeAudioIterator>;
