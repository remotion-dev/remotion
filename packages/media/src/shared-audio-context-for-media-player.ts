export type ScheduleAudioNodeOptions = {
	node: AudioBufferSourceNode;
	mediaTimestamp: number;
	currentMediaTime: number;
	combinedPlaybackRate: number;
	maxDuration: number | null;
};

export type SharedAudioContextForMediaPlayer = {
	audioContext: AudioContext | null;
	audioSyncAnchor: {value: number} | null;
	scheduleAudioNode: ((options: ScheduleAudioNodeOptions) => boolean) | null;
};
