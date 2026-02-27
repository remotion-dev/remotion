export type ScheduleAudioNodeOptions = {
	node: AudioBufferSourceNode;
	mediaTimestamp: number;
	targetTime: number;
};

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (options: ScheduleAudioNodeOptions) => boolean;
};
