import type {ScheduleAudioNodeOptions} from 'remotion';

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (options: ScheduleAudioNodeOptions) => boolean;
};
