import type {
	AllOptions,
	Options,
	ParseMediaCallbacks,
	ParseMediaFields,
} from './options';

export const getFieldsFromCallback = <F extends Options<ParseMediaFields>>({
	fields,
	callbacks,
}: {
	fields: F;
	callbacks: ParseMediaCallbacks;
}): Options<ParseMediaFields> => {
	const newFields: AllOptions<ParseMediaFields> = {
		audioCodec: Boolean(callbacks.onAudioCodec),
		container: Boolean(callbacks.onContainer),
		dimensions: Boolean(callbacks.onDimensions),
		durationInSeconds: Boolean(callbacks.onDurationInSeconds),
		fps: Boolean(callbacks.onFps),
		internalStats: Boolean(callbacks.onInternalStats),
		isHdr: Boolean(callbacks.onIsHdr),
		location: Boolean(callbacks.onLocation),
		metadata: Boolean(callbacks.onMetadata),
		mimeType: Boolean(callbacks.onMimeType),
		name: Boolean(callbacks.onName),
		rotation: Boolean(callbacks.onRotation),
		size: Boolean(callbacks.onSize),
		structure: Boolean(callbacks.onStructure),
		tracks: Boolean(callbacks.onTracks),
		unrotatedDimensions: Boolean(callbacks.onUnrotatedDimensions),
		videoCodec: Boolean(callbacks.onVideoCodec),
		slowKeyframes: Boolean(callbacks.onSlowKeyframes),
		slowDurationInSeconds: Boolean(callbacks.onSlowDurationInSeconds),
		slowFps: Boolean(callbacks.onSlowFps),
		slowNumberOfFrames: Boolean(callbacks.onSlowNumberOfFrames),
		keyframes: Boolean(callbacks.onKeyframes),
		images: Boolean(callbacks.onImages),
		numberOfAudioChannels: Boolean(callbacks.onNumberOfAudioChannels),
		sampleRate: Boolean(callbacks.onSampleRate),
		slowAudioBitrate: Boolean(callbacks.onSlowAudioBitrate),
		slowVideoBitrate: Boolean(callbacks.onSlowVideoBitrate),
		m3uStreams: Boolean(callbacks.onM3uStreams),
		...fields,
	};
	return newFields;
};
