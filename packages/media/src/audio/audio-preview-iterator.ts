import type {AudioBufferSink} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {makeIteratorWithPriming} from '../make-iterator-with-priming';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;
export const ALLOWED_GLOBAL_TIME_ANCHOR_SHIFT = 0.1;

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
	audioSink,
	loop,
	playbackRate,
	sequenceDurationInSeconds,
	unscheduleAudioNode,
}: {
	startFromSecond: number;
	maximumTimestamp: number;
	logLevel: LogLevel;
	audioSink: AudioBufferSink;
	loop: boolean;
	playbackRate: number;
	sequenceDurationInSeconds: number;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
}) => {
	let destroyed = false;
	const iterator = makeIteratorWithPriming({
		audioSink,
		timeToSeek: startFromSecond,
		maximumTimestamp,
		loop,
		playbackRate,
		sequenceDurationInSeconds,
	});
	const queuedAudioNodes: QueuedNode[] = [];
	let mostRecentTimestamp = -Infinity;

	const cleanupAudioQueue = () => {
		for (const node of queuedAudioNodes) {
			unscheduleAudioNode(node.node);
			try {
				node.node.stop();
			} catch {
				// Node may not have been started
			}
		}

		queuedAudioNodes.length = 0;
	};

	const getNextFn = async () => {
		const next = await iterator.next();

		if (next.value) {
			mostRecentTimestamp = Math.max(
				mostRecentTimestamp,
				next.value.timestamp + next.value.buffer.duration,
			);
		}

		return next;
	};

	return {
		destroy: () => {
			cleanupAudioQueue();
			destroyed = true;
			iterator.return().catch(() => undefined);
		},
		getNextFn,
		isDestroyed: () => {
			return destroyed;
		},

		addQueuedAudioNode: ({
			node,
			timestamp,
			buffer,
			scheduledTime,
			scheduledAtAnchor,
		}: {
			node: AudioBufferSourceNode;
			timestamp: number;
			buffer: AudioBuffer;
			scheduledTime: number;
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
		guessNextTimestamp: () => {
			return !Number.isFinite(mostRecentTimestamp)
				? startFromSecond
				: mostRecentTimestamp;
		},
		getQueuedPeriod: () => {
			let until = -Infinity;
			let from = Infinity;

			for (const node of queuedAudioNodes) {
				until = Math.max(until, node.timestamp + node.buffer.duration);
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
