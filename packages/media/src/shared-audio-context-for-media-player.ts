export type ScheduleAudioNodeOptions = {
	node: AudioBufferSourceNode;
	mediaTimestamp: number;
	currentMediaTime: number;
	combinedPlaybackRate: number;
	maxDuration: number | null;
};

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext;
	audioSyncAnchor: {value: number};
	scheduleAudioNode: (options: ScheduleAudioNodeOptions) => boolean;
};
