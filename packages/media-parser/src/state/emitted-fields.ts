import type {AllOptions, ParseMediaFields} from '../options';

export const emittedState = () => {
	const emittedFields: AllOptions<ParseMediaFields> = {
		audioCodec: false,
		container: false,
		dimensions: false,
		durationInSeconds: false,
		fps: false,
		internalStats: false,
		isHdr: false,
		location: false,
		metadata: false,
		mimeType: false,
		name: false,
		rotation: false,
		size: false,
		structure: false,
		tracks: false,
		videoCodec: false,
		unrotatedDimensions: false,
		slowDurationInSeconds: false,
		slowFps: false,
		slowKeyframes: false,
		slowNumberOfFrames: false,
		keyframes: false,
		images: false,
		numberOfAudioChannels: false,
		sampleRate: false,
		slowAudioBitrate: false,
		slowVideoBitrate: false,
		m3uStreams: false,
	};

	return emittedFields;
};
