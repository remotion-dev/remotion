import {Internals} from 'remotion';
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
	Internals.playbackDiagnostics.audioIteratorsCreated++;
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
	let waitingForFirstChunk = true;

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
		waitingForFirstChunk = false;
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

	let pendingChunk: IteratorResult<AudioBufferSlice, void> | null = null;
	let pendingError: {error: unknown} | null = null;
	const getNextFn = async (): Promise<
		IteratorResult<AudioBufferSlice, void>
	> => {
		if (destroyed) return {done: true, value: undefined};
		if (pendingError) {
			const {error} = pendingError;
			pendingError = null;
			throw error;
		}

		const current = pendingChunk ?? (await iterator.next());
		if (destroyed) return {done: true, value: undefined};
		if (current.done) {
			pendingChunk = null;
			waitingForFirstChunk = false;
			return current;
		}

		let next: IteratorResult<AudioBufferSlice, void>;
		try {
			next = await iterator.next();
		} catch (error) {
			if (destroyed) return {done: true, value: undefined};
			// Deliver the decoded window before reporting a failed neighboring read.
			pendingError = {error};
			next = {done: true, value: undefined};
		}

		if (destroyed) return {done: true, value: undefined};
		pendingChunk = next;
		const slice = current.value;
		const {buffer} = slice.buffer;
		// Preserve the resampling neighborhood without extending audible ownership.
		// Source continuity excludes looping resets even on a continuous timeline.
		const nextSlice = next.value;
		const after = nextSlice?.buffer.buffer;
		let value = slice;
		if (
			nextSlice &&
			after &&
			nextSlice.sourceOffsetInSeconds === 0 &&
			buffer.sampleRate === after.sampleRate &&
			buffer.numberOfChannels === after.numberOfChannels &&
			Math.round(
				(nextSlice.buffer.timestamp - slice.buffer.timestamp) *
					buffer.sampleRate,
			) === buffer.length &&
			Math.round(
				(nextSlice.timelineTimestamp -
					slice.timelineTimestamp -
					slice.sourceDurationInSeconds) *
					buffer.sampleRate,
			) === 0
		) {
			const combined = new AudioBuffer({
				numberOfChannels: buffer.numberOfChannels,
				sampleRate: buffer.sampleRate,
				length: buffer.length + after.length,
			});
			for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
				const plane = combined.getChannelData(channel);
				plane.set(buffer.getChannelData(channel));
				plane.set(after.getChannelData(channel), buffer.length);
			}

			value = {...slice, buffer: {...slice.buffer, buffer: combined}};
		}

		waitingForFirstChunk = false;
		mostRecentTimestamp = Math.max(
			mostRecentTimestamp,
			slice.timelineTimestamp + slice.sourceDurationInSeconds,
		);
		return {value, done: false};
	};

	return {
		destroy: () => {
			clearSchedule();
			destroyed = true;
			pendingChunk = null;
			pendingError = null;
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
			const canKeepPendingRead =
				waitingForFirstChunk && time === startFromSecond;
			if (
				destroyed ||
				(!canKeepPendingRead &&
					!queued.some(
						(item) =>
							time >= item.timestamp &&
							time < item.timestamp + item.sourceDurationInSeconds,
					))
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
