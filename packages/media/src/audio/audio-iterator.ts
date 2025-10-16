import type {AudioBufferSink} from 'mediabunny';

export const HEALTHY_BUFFER_THRESHOLD_SECONDS = 1;

export const makeAudioIterator = (
	audioSink: AudioBufferSink,
	startFromSecond: number,
) => {
	const iterator = audioSink.buffers(startFromSecond);
	let audioIteratorStarted = false;
	let audioBufferHealth = 0;

	return {
		iterator,
		destroy: () => {
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
	};
};

export type AudioIterator = ReturnType<typeof makeAudioIterator>;
