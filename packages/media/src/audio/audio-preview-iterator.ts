import type {AudioBufferSink} from 'mediabunny';

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
	};
};

export type AudioIterator = ReturnType<typeof makeAudioIterator>;
