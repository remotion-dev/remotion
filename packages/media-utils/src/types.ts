export type MediaUtilsAudioData = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	durationInSeconds: number;
	numberOfChannels: number;
	resultId: string;
	isRemote: boolean;
};

/**
 * @deprecated renamed to MediaUtilsAudioData instead
 */
export type AudioData = MediaUtilsAudioData;

export type VideoMetadata = {
	durationInSeconds: number;
	width: number;
	height: number;
	aspectRatio: number;
	isRemote: boolean;
};

export type ImageDimensions = {width: number; height: number};
