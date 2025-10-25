import type {AudioBufferSink, WrappedAudioBuffer} from 'mediabunny';
import {roundTo4Digits} from '../helpers/round-to-4-digits';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export type QueuedNode = {
	node: AudioBufferSourceNode;
	timestamp: number;
	buffer: AudioBuffer;
};

export const makeAudioIterator = (
	audioSink: AudioBufferSink,
	startFromSecond: number,
) => {
	let destroyed = false;
	const iterator = audioSink.buffers(startFromSecond);
	const queuedAudioNodes: QueuedNode[] = [];
	const audioChunksForAfterResuming: {
		buffer: AudioBuffer;
		timestamp: number;
	}[] = [];

	const cleanupAudioQueue = () => {
		for (const node of queuedAudioNodes) {
			node.node.stop();
		}

		queuedAudioNodes.length = 0;
	};

	let lastReturnedBuffer: WrappedAudioBuffer | null = null;
	let iteratorEnded = false;

	const getNextOrNullIfNotAvailable = async (allowWait: boolean) => {
		const next = iterator.next();
		const result = allowWait
			? await next
			: await Promise.race([
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
		allowWait: boolean,
	): Promise<
		| {
				type: 'not-satisfied';
				reason: string;
		  }
		| {
				type: 'satisfied';
				buffers: WrappedAudioBuffer[];
		  }
	> => {
		if (lastReturnedBuffer) {
			const bufferTimestamp = roundTo4Digits(lastReturnedBuffer.timestamp);
			const bufferEndTimestamp = roundTo4Digits(
				lastReturnedBuffer.timestamp + lastReturnedBuffer.duration,
			);

			if (roundTo4Digits(time) < bufferTimestamp) {
				return {
					type: 'not-satisfied' as const,
					reason: `iterator is too far, most recently returned ${bufferTimestamp}-${bufferEndTimestamp}, requested ${time}`,
				};
			}

			if (roundTo4Digits(time) <= bufferEndTimestamp) {
				return {
					type: 'satisfied' as const,
					buffers: [lastReturnedBuffer],
				};
			}

			// fall through
		}

		if (iteratorEnded) {
			return {
				type: 'satisfied' as const,
				buffers: lastReturnedBuffer ? [lastReturnedBuffer] : [],
			};
		}

		const toBeReturned: WrappedAudioBuffer[] = [];

		while (true) {
			const buffer = await getNextOrNullIfNotAvailable(allowWait);
			if (buffer.type === 'need-to-wait-for-it') {
				return {
					type: 'not-satisfied' as const,
					reason: 'iterator did not have buffer ready',
				};
			}

			if (buffer.type === 'got-buffer-or-end') {
				if (buffer.buffer === null) {
					iteratorEnded = true;
					return {
						type: 'satisfied' as const,
						buffers: lastReturnedBuffer ? [lastReturnedBuffer] : [],
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
						buffers: [...toBeReturned, buffer.buffer],
					};
				}

				toBeReturned.push(buffer.buffer);

				continue;
			}

			throw new Error('Unreachable');
		}
	};

	const removeAndReturnAllQueuedAudioNodes = () => {
		const nodes = queuedAudioNodes.slice();
		for (const node of nodes) {
			node.node.stop();
		}

		queuedAudioNodes.length = 0;
		return nodes;
	};

	const addChunkForAfterResuming = (buffer: AudioBuffer, timestamp: number) => {
		audioChunksForAfterResuming.push({buffer, timestamp});
	};

	const moveQueuedChunksToPauseQueue = () => {
		const toQueue = removeAndReturnAllQueuedAudioNodes();
		for (const chunk of toQueue) {
			addChunkForAfterResuming(chunk.buffer, chunk.timestamp);
		}
	};

	const getNumberOfChunksAfterResuming = () => {
		return audioChunksForAfterResuming.length;
	};

	return {
		destroy: () => {
			cleanupAudioQueue();
			destroyed = true;
			iterator.return().catch(() => undefined);
			audioChunksForAfterResuming.length = 0;
		},
		getNext: async () => {
			const next = await iterator.next();
			if (next.value) {
				lastReturnedBuffer = next.value;
			} else {
				iteratorEnded = true;
			}

			return next;
		},
		isDestroyed: () => {
			return destroyed;
		},
		addQueuedAudioNode: (
			node: AudioBufferSourceNode,
			timestamp: number,
			buffer: AudioBuffer,
		) => {
			queuedAudioNodes.push({node, timestamp, buffer});
		},
		removeQueuedAudioNode: (node: AudioBufferSourceNode) => {
			const index = queuedAudioNodes.findIndex((n) => n.node === node);
			if (index !== -1) {
				queuedAudioNodes.splice(index, 1);
			}
		},
		getAndClearAudioChunksForAfterResuming: () => {
			const chunks = audioChunksForAfterResuming.slice();
			audioChunksForAfterResuming.length = 0;
			return chunks;
		},
		getQueuedPeriod: (pendingBuffers: WrappedAudioBuffer[]) => {
			let until = -Infinity;
			let from = Infinity;

			for (const buffer of pendingBuffers) {
				until = Math.max(until, buffer.timestamp + buffer.duration);
				from = Math.min(from, buffer.timestamp);
			}

			for (const node of queuedAudioNodes) {
				until = Math.max(until, node.timestamp + node.buffer.duration);
				from = Math.min(from, node.timestamp);
			}

			for (const chunk of audioChunksForAfterResuming) {
				until = Math.max(until, chunk.timestamp + chunk.buffer.duration);
				from = Math.min(from, chunk.timestamp);
			}

			if (!Number.isFinite(from) || !Number.isFinite(until)) {
				return null;
			}

			return {
				from,
				until,
			};
		},
		tryToSatisfySeek,
		addChunkForAfterResuming,
		moveQueuedChunksToPauseQueue,
		getNumberOfChunksAfterResuming,
	};
};

export type AudioIterator = ReturnType<typeof makeAudioIterator>;

export const isAlreadyQueued = (
	time: number,
	queuedPeriod: {from: number; until: number} | undefined | null,
) => {
	if (!queuedPeriod) {
		return false;
	}

	return time >= queuedPeriod.from && time < queuedPeriod.until;
};
