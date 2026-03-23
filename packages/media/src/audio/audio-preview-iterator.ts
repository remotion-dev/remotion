import type {WrappedAudioBuffer} from 'mediabunny';
import {Internals} from 'remotion';
import {roundTo4Digits} from '../helpers/round-to-4-digits';
import type {PrewarmedAudioIteratorCache} from '../prewarm-iterator-for-looping';
import {ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT} from '../set-global-time-anchor';
import type {SharedAudioContextForMediaPlayer} from '../shared-audio-context-for-media-player';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export type QueuedNode = {
	node: AudioBufferSourceNode;
	timestamp: number;
	buffer: AudioBuffer;
	scheduledTime: number;
	playbackRate: number;
	scheduledAtAnchor: number;
};

export type QueuedPeriod = {
	from: number;
	until: number;
};

export const makeAudioIterator = ({
	startFromSecond,
	maximumTimestamp,
	cache,
	debugAudioScheduling,
}: {
	startFromSecond: number;
	maximumTimestamp: number;
	cache: PrewarmedAudioIteratorCache;
	debugAudioScheduling: boolean;
}) => {
	let destroyed = false;
	const iterator = cache.makeIteratorOrUsePrewarmed(
		startFromSecond,
		maximumTimestamp,
	);
	const queuedAudioNodes: QueuedNode[] = [];
	const audioChunksForAfterResuming: {
		buffer: AudioBuffer;
		timestamp: number;
	}[] = [];
	let mostRecentTimestamp = -Infinity;
	let pendingNext: Promise<IteratorResult<WrappedAudioBuffer, void>> | null =
		null;

	const cleanupAudioQueue = (
		audioContext: SharedAudioContextForMediaPlayer,
	) => {
		for (const node of queuedAudioNodes) {
			try {
				// When we unmount at the end of playback, we might not yet be done with audio anchors
				// we should not stop the nodes
				const isAlreadyPlaying =
					node.scheduledTime - ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT <
					audioContext.audioContext.currentTime;

				// except for when the audio anchor changed (e.g. through a seek)
				const wasScheduledForThisAnchor =
					node.scheduledAtAnchor === audioContext.audioSyncAnchor.value;

				if (isAlreadyPlaying && wasScheduledForThisAnchor) {
					continue;
				}

				if (debugAudioScheduling) {
					const currentlyHearing =
						audioContext.audioContext.getOutputTimestamp().contextTime!;
					const nodeEndTime =
						node.scheduledTime + node.buffer.duration / node.playbackRate;

					Internals.Log.info(
						{logLevel: 'trace', tag: 'audio-scheduling'},
						`Stopping node ${node.timestamp.toFixed(3)}, currently hearing = ${currentlyHearing.toFixed(3)} currentTime = ${audioContext.audioContext.currentTime.toFixed(3)} nodeEndTime = ${nodeEndTime.toFixed(3)} scheduledTime = ${node.scheduledTime.toFixed(3)}`,
					);
				}

				node.node.stop();
			} catch {
				// Node may not have been started
			}
		}

		queuedAudioNodes.length = 0;
	};

	const getNextOrNullIfNotAvailable = async () => {
		let next = pendingNext;

		if (!next) {
			next = iterator.next();
		}

		pendingNext = null;
		const result = await Promise.race([
			next,
			new Promise<void>((resolve) => {
				Promise.resolve().then(() => resolve());
			}),
		]);

		if (!result) {
			pendingNext = next;
			return {
				type: 'need-to-wait-for-it' as const,
				waitPromise: async () => {
					const res = await next;
					return res.value;
				},
			};
		}

		if (result.value) {
			mostRecentTimestamp = Math.max(
				mostRecentTimestamp,
				result.value.timestamp + result.value.duration,
			);
			// preload next already
			pendingNext = iterator.next();
			return {
				type: 'got-buffer' as const,
				buffer: result.value,
			};
		}

		return {
			type: 'got-end' as const,
			mostRecentTimestamp,
		};
	};

	const tryToSatisfySeek = async (
		time: number,
		onBufferScheduled: (buffer: WrappedAudioBuffer) => void,
	): Promise<
		| {
				type: 'not-satisfied';
				reason: string;
		  }
		| {
				type: 'ended';
		  }
		| {
				type: 'satisfied';
		  }
	> => {
		if (time < startFromSecond) {
			return {
				type: 'not-satisfied' as const,
				reason: `time requested is before the start of the iterator`,
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

			if (buffer.type === 'got-end') {
				if (time >= mostRecentTimestamp) {
					return {
						type: 'ended' as const,
					};
				}

				return {
					type: 'not-satisfied' as const,
					reason: `iterator ended before the requested time`,
				};
			}

			if (buffer.type === 'got-buffer') {
				const bufferTimestamp = roundTo4Digits(buffer.buffer.timestamp);
				const bufferEndTimestamp = roundTo4Digits(
					buffer.buffer.timestamp + buffer.buffer.duration,
				);

				const timestamp = roundTo4Digits(time);

				if (timestamp < bufferTimestamp) {
					return {
						type: 'not-satisfied' as const,
						reason: `iterator is too far, most recently returned ${bufferTimestamp}-${bufferEndTimestamp}, requested ${timestamp}`,
					};
				}

				if (bufferTimestamp <= timestamp && bufferEndTimestamp >= timestamp) {
					onBufferScheduled(buffer.buffer);
					return {
						type: 'satisfied' as const,
					};
				}

				onBufferScheduled(buffer.buffer);

				continue;
			}

			throw new Error('Unreachable');
		}
	};

	const bufferAsFarAsPossible = async (
		onBufferScheduled: (buffer: WrappedAudioBuffer) => void,
		maxTimestamp: number,
	): Promise<{type: 'ended'} | {type: 'waiting'} | {type: 'max-reached'}> => {
		while (true) {
			if (mostRecentTimestamp >= maxTimestamp) {
				return {type: 'max-reached'};
			}

			const buffer = await getNextOrNullIfNotAvailable();
			if (buffer.type === 'need-to-wait-for-it') {
				return {type: 'waiting'};
			}

			if (buffer.type === 'got-end') {
				return {type: 'ended'};
			}

			if (buffer.type === 'got-buffer') {
				onBufferScheduled(buffer.buffer);
				continue;
			}

			throw new Error('Unreachable');
		}
	};

	const removeAndReturnAllQueuedAudioNodes = () => {
		const nodes = queuedAudioNodes.slice();
		for (const node of nodes) {
			try {
				node.node.stop();
			} catch {
				// Node may not have been started
			}
		}

		queuedAudioNodes.length = 0;
		return nodes;
	};

	const addChunkForAfterResuming = (buffer: AudioBuffer, timestamp: number) => {
		audioChunksForAfterResuming.push({
			buffer,
			timestamp,
		});
	};

	const moveQueuedChunksToPauseQueue = () => {
		const toQueue = removeAndReturnAllQueuedAudioNodes();
		for (const chunk of toQueue) {
			addChunkForAfterResuming(chunk.buffer, chunk.timestamp);
		}

		if (debugAudioScheduling && toQueue.length > 0) {
			Internals.Log.trace(
				{logLevel: 'trace', tag: 'audio-scheduling'},
				`Moved ${toQueue.length} ${toQueue.length === 1 ? 'chunk' : 'chunks'} to pause queue (${toQueue[0].timestamp.toFixed(3)}-${toQueue[toQueue.length - 1].timestamp + toQueue[toQueue.length - 1].buffer.duration.toFixed(3)})`,
			);
		}
	};

	const getNumberOfChunksAfterResuming = () => {
		return audioChunksForAfterResuming.length;
	};

	return {
		destroy: (audioContext: SharedAudioContextForMediaPlayer) => {
			cleanupAudioQueue(audioContext);
			destroyed = true;
			iterator.return().catch(() => undefined);
			audioChunksForAfterResuming.length = 0;
		},
		getNext: async () => {
			const next = await iterator.next();
			if (next.value) {
				mostRecentTimestamp = Math.max(
					mostRecentTimestamp,
					next.value.timestamp + next.value.duration,
				);
			}

			return next;
		},
		isDestroyed: () => {
			return destroyed;
		},

		addQueuedAudioNode: ({
			node,
			timestamp,
			buffer,
			scheduledTime,
			playbackRate,
			scheduledAtAnchor,
		}: {
			node: AudioBufferSourceNode;
			timestamp: number;
			buffer: AudioBuffer;
			scheduledTime: number;
			playbackRate: number;
			scheduledAtAnchor: number;
		}) => {
			queuedAudioNodes.push({
				node,
				timestamp,
				buffer,
				scheduledTime,
				playbackRate,
				scheduledAtAnchor,
			});
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
		getQueuedPeriod: () => {
			let until = -Infinity;
			let from = Infinity;

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
		bufferAsFarAsPossible,
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
