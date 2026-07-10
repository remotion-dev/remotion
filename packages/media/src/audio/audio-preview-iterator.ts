import type {BufferWithMediaTimestamp} from '../make-iterator-with-priming';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;
export const ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT = 0.1;

export type QueuedNode = {
	node: AudioBufferSourceNode;
	timestamp: number;
	buffer: AudioBuffer;
	timelineDurationInSeconds: number;
	scheduledTime: number;
	playbackRate: number;
	scheduledAtAnchor: number;
};

export type QueuedPeriod = {
	from: number;
	until: number;
};

export type MakeAudioIteratorOptions = {
	startFromSecond: number;
	iterator: AsyncGenerator<BufferWithMediaTimestamp, void, unknown>;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
};

export const makeAudioIterator = ({
	startFromSecond,
	iterator,
	unscheduleAudioNode,
}: MakeAudioIteratorOptions) => {
	let destroyed = false;
	const queuedAudioNodes: QueuedNode[] = [];
	let mostRecentTimestamp = -Infinity;

	const cleanupAudioQueue = () => {
		for (const {node} of queuedAudioNodes) {
			unscheduleAudioNode(node);
			try {
				node.stop();
			} catch {
				// AudioBufferSourceNode.stop() throws if the node was never started.
				// Cleanup is a safe boundary: it must continue stopping other nodes.
			}
		}

		queuedAudioNodes.length = 0;
	};

	const getNextFn = async () => {
		const next = await iterator.next();

		if (next.value) {
			mostRecentTimestamp = Math.max(
				mostRecentTimestamp,
				next.value.timestamp + next.value.timelineDurationInSeconds,
			);
		}

		return next;
	};

	return {
		destroy: () => {
			cleanupAudioQueue();
			destroyed = true;
			// Returning an async generator can reject if its underlying media input
			// was disposed. Destruction is fire-and-forget and has no caller to
			// propagate to, so intentionally consume that teardown-only rejection.
			iterator.return().catch(() => undefined);
		},
		getNextFn,
		isDestroyed: () => {
			return destroyed;
		},

		addQueuedAudioNode: (queuedNode: QueuedNode) => {
			queuedAudioNodes.push(queuedNode);
		},
		guessNextTimestamp: () => {
			return !Number.isFinite(mostRecentTimestamp)
				? startFromSecond
				: mostRecentTimestamp;
		},
		getQueuedPeriod: () => {
			let until = -Infinity;
			let from = Infinity;

			for (const node of queuedAudioNodes) {
				until = Math.max(
					until,
					node.timestamp + node.timelineDurationInSeconds,
				);
				from = Math.min(from, node.timestamp);
			}

			if (!Number.isFinite(from) || !Number.isFinite(until)) {
				return null;
			}

			return {
				from,
				until,
			};
		},
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
