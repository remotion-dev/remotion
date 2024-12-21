import type {AllOptions, Options, ParseMediaFields} from '../options';
import type {Structure} from '../parse-result';

const needsSamples: Record<keyof Options<ParseMediaFields>, boolean> = {
	audioCodec: false,
	container: false,
	dimensions: false,
	durationInSeconds: false,
	slowDurationInSeconds: true,
	fps: false,
	internalStats: false,
	isHdr: false,
	name: false,
	rotation: false,
	size: false,
	structure: false,
	tracks: false,
	unrotatedDimensions: false,
	videoCodec: false,
	metadata: false,
	location: false,
	mimeType: false,
	keyframes: true,
};

export const needsToIterateOverSamples = ({
	fields,
	structure,
	emittedFields,
}: {
	fields: Options<ParseMediaFields>;
	structure: Structure;
	emittedFields: AllOptions<ParseMediaFields>;
}) => {
	// We can get keyframes from the metadata!
	if (structure.type === 'iso-base-media') {
		return false;
	}

	const keys = Object.keys(fields ?? {}) as (keyof Options<ParseMediaFields>)[];
	const selectedKeys = keys.filter((k) => fields[k]);
	return selectedKeys.some((k) => needsSamples[k] && !emittedFields[k]);
};
