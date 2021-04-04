export type AudioData = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	duration: number;
	numberOfChannels: number;
	resultId: string;
	isRemote: boolean;
};

export type VideoData = {
	duration: number;
	width: number;
	height: number;
	aspectRatio: number;
	isRemote: boolean;
};
