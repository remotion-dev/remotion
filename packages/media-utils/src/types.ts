export type AudioData = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	duration: number;
	numberOfChannels: number;
	resultId: string;
};
