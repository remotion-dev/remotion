export type ScheduleAudioNodeOptions = {
	node: AudioBufferSourceNode;
	mediaTimestamp: number;
	targetTime: number;
	currentTime: number;
	endTime: number;
	startTime: number;
};

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (options: ScheduleAudioNodeOptions) => boolean;
};
