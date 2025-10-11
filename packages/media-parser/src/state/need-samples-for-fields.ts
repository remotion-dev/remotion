import type {AllOptions, Options, ParseMediaFields} from '../fields';

export const fieldsNeedSamplesMap: Record<
	keyof Options<ParseMediaFields>,
	boolean
> = {
	slowDurationInSeconds: true,
	slowFps: true,
	slowKeyframes: true,
	slowNumberOfFrames: true,
	audioCodec: false,
	container: false,
	dimensions: false,
	durationInSeconds: false,
	fps: false,
	internalStats: false,
	isHdr: false,
	name: false,
	rotation: false,
	size: false,
	slowStructure: false,
	tracks: false,
	unrotatedDimensions: false,
	videoCodec: false,
	metadata: false,
	location: false,
	mimeType: false,
	keyframes: false,
	images: false,
	numberOfAudioChannels: false,
	sampleRate: false,
	slowAudioBitrate: true,
	slowVideoBitrate: true,
	m3uStreams: false,
};

export const needsToIterateOverSamples = ({
	fields,
	emittedFields,
}: {
	fields: Options<ParseMediaFields>;
	emittedFields: AllOptions<ParseMediaFields>;
}) => {
	const keys = Object.keys(fields ?? {}) as (keyof Options<ParseMediaFields>)[];
	const selectedKeys = keys.filter((k) => fields[k]);

	return selectedKeys.some((k) => fieldsNeedSamplesMap[k] && !emittedFields[k]);
};

// For duration, we only need the first and last sample
const fieldsNeedEverySampleMap: Record<
	keyof Options<ParseMediaFields>,
	boolean
> = {
	...fieldsNeedSamplesMap,
	slowDurationInSeconds: false,
};

export const needsToIterateOverEverySample = ({
	fields,
	emittedFields,
}: {
	fields: Options<ParseMediaFields>;
	emittedFields: AllOptions<ParseMediaFields>;
}) => {
	const keys = Object.keys(fields ?? {}) as (keyof Options<ParseMediaFields>)[];
	const selectedKeys = keys.filter((k) => fields[k]);

	return selectedKeys.some(
		(k) => fieldsNeedEverySampleMap[k] && !emittedFields[k],
	);
};
