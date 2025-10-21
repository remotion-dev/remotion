import type {AudioBufferSink} from 'mediabunny';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export const makeAudioIterator = (
	audioSink: AudioBufferSink,
	startFromSecond: number,
) => {
	let destroyed = false;
	const iterator = audioSink.buffers(startFromSecond);
	let audioIteratorStarted = false;
	let audioBufferHealth = 0;
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
		isReadyToPlay: () => {
			return audioIteratorStarted && audioBufferHealth > 0;
		},
		setAudioIteratorStarted: (started: boolean) => {
			audioIteratorStarted = started;
		},
		getNext: () => {
			return iterator.next();
		},
		setAudioBufferHealth: (health: number) => {
			audioBufferHealth = health;
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
