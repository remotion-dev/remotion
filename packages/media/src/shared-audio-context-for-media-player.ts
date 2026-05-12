import type {ScheduleAudioNodeOptions, ScheduleAudioNodeResult} from 'remotion';

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	gainNode: GainNode;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (
		options: ScheduleAudioNodeOptions,
	) => ScheduleAudioNodeResult;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
};
