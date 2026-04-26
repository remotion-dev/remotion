import type {ScheduleAudioNodeOptions, ScheduleAudioNodeResult} from 'remotion';

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	masterGain: GainNode;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (
		options: ScheduleAudioNodeOptions,
	) => ScheduleAudioNodeResult;
};
