import type {AudioBufferSlice} from '../make-iterator-with-priming';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export type PreparedAudioChunk = {
	buffer: AudioBuffer;
	timestamp: number;
	originalUnloopedMediaTimestamp: number;
	sourceOffsetInSeconds: number;
	sourceDurationInSeconds: number;
};

export type QueuedPeriod = {
	from: number;
	until: number;
};

export type MakeAudioIteratorOptions = {
	startFromSecond: number;
	iterator: AsyncGenerator<AudioBufferSlice, void, unknown>;
	scheduleChunk: (chunk: PreparedAudioChunk) => AudioBufferSourceNode | null;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => boolean | void;
};

export const makeAudioIterator = ({
	startFromSecond,
	iterator,
	scheduleChunk,
	unscheduleAudioNode,
}: MakeAudioIteratorOptions) => {
	let destroyed = false;
	const queuedAudioNodes = new Map<AudioBufferSourceNode, PreparedAudioChunk>();
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

	const clearSchedule = () => {
		for (const node of queuedAudioNodes.keys()) {
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

	const scheduleAudio = (chunk: PreparedAudioChunk) => {
		if (destroyed) return;
		const node = scheduleChunk(chunk);
		if (!node) return;
		queuedFrom = Math.min(queuedFrom, chunk.timestamp);
		queuedUntil = Math.max(
			queuedUntil,
			chunk.timestamp + chunk.sourceDurationInSeconds,
		);
		queuedAudioNodes.set(node, chunk);
		node.addEventListener('ended', onEnded, {once: true});
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
			clearSchedule();
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

		scheduleAudio,
		// Keep the decoder and its in-flight read. WebAudio nodes are one-shot,
		// so replace only their scheduling after the shared clock moves.
		rescheduleAudio: (time: number) => {
			const queued = [...queuedAudioNodes.values()];
			if (
				destroyed ||
				!queued.some(
					(item) =>
						time >= item.timestamp &&
						time < item.timestamp + item.sourceDurationInSeconds,
				)
			) {
				return false;
			}

			clearSchedule();
			for (const chunk of queued) scheduleAudio(chunk);
			return true;
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
