export type AudioData = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	durationInSeconds: number;
	numberOfChannels: number;
	resultId: string;
	isRemote: boolean;
};

export type VideoMetadata = {
	durationInSeconds: number;
	width: number;
	height: number;
	aspectRatio: number;
	isRemote: boolean;
};

export type ImageDimensions = {width: number; height: number};
