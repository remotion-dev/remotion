import type {AudioBufferSlice} from '../make-iterator-with-priming';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export type QueuedNode = {
	node: AudioBufferSourceNode;
	timestamp: number;
	sourceDurationInSeconds: number;
};

export type QueuedPeriod = {
	from: number;
	until: number;
};

export type MakeAudioIteratorOptions = {
	startFromSecond: number;
	iterator: AsyncGenerator<AudioBufferSlice, void, unknown>;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => boolean | void;
};

export const makeAudioIterator = ({
	startFromSecond,
	iterator,
	unscheduleAudioNode,
}: MakeAudioIteratorOptions) => {
	let destroyed = false;
	const queuedAudioNodes = new Set<AudioBufferSourceNode>();
	// Seek deduplication needs the scheduling history, including ended audio and
	// silent gaps. Keep its bounds without retaining the historical nodes.
	let queuedFrom = Infinity;
	let queuedUntil = -Infinity;
	const onEnded = (event: Event) => {
		const node = event.currentTarget as AudioBufferSourceNode;
		queuedAudioNodes.delete(node);
		node.disconnect();
	};

	let mostRecentTimestamp = -Infinity;

	const cleanupAudioQueue = () => {
		for (const node of queuedAudioNodes) {
			// Pending nodes may never emit ended; remove their listener synchronously.
			node.removeEventListener('ended', onEnded);
			node.disconnect();
			if (unscheduleAudioNode(node) === true) {
				continue;
			}

			try {
				node.stop();
			} catch {
				// AudioBufferSourceNode.stop() throws if the node was never started.
				// Cleanup is a safe boundary: it must continue stopping other nodes.
			}
		}

		queuedAudioNodes.clear();
		queuedFrom = Infinity;
		queuedUntil = -Infinity;
	};

	const getNextFn = async () => {
		const next = await iterator.next();

		if (next.value) {
			mostRecentTimestamp = Math.max(
				mostRecentTimestamp,
				next.value.timelineTimestamp + next.value.sourceDurationInSeconds,
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
			queuedFrom = Math.min(queuedFrom, queuedNode.timestamp);
			queuedUntil = Math.max(
				queuedUntil,
				queuedNode.timestamp + queuedNode.sourceDurationInSeconds,
			);
			queuedAudioNodes.add(queuedNode.node);
			queuedNode.node.addEventListener('ended', onEnded, {once: true});
		},
		guessNextTimestamp: () => {
			return !Number.isFinite(mostRecentTimestamp)
				? startFromSecond
				: mostRecentTimestamp;
		},
		getQueuedPeriod: () => {
			const from = queuedFrom;
			const until = queuedUntil;

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
