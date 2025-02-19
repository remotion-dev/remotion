import type {Options, ParseMediaFields} from '../options';
import type {Structure} from '../parse-result';
import type {StructureState} from './structure';

export const needsTracksForField = ({
	field,
	structure,
}: {
	field: keyof Options<ParseMediaFields>;
	structure: Structure;
}) => {
	if (field === 'dimensions') {
		if (structure.type === 'riff') {
			return false;
		}

		return true;
	}

	if (
		field === 'audioCodec' ||
		field === 'durationInSeconds' ||
		field === 'slowDurationInSeconds' ||
		field === 'slowFps' ||
		field === 'fps' ||
		field === 'isHdr' ||
		field === 'rotation' ||
		field === 'structure' ||
		field === 'tracks' ||
		field === 'unrotatedDimensions' ||
		field === 'videoCodec' ||
		field === 'metadata' ||
		field === 'location' ||
		field === 'slowKeyframes' ||
		field === 'slowNumberOfFrames' ||
		field === 'keyframes' ||
		field === 'images' ||
		field === 'sampleRate' ||
		field === 'numberOfAudioChannels' ||
		field === 'slowAudioBitrate' ||
		field === 'slowVideoBitrate' ||
		field === 'm3uStreams'
	) {
		return true;
	}

	if (
		field === 'container' ||
		field === 'internalStats' ||
		field === 'mimeType' ||
		field === 'name' ||
		field === 'size'
	) {
		return false;
	}

	throw new Error(`field not implemeted ${field satisfies never}`);
};

export const makeCanSkipTracksState = ({
	hasAudioTrackHandlers,
	fields,
	hasVideoTrackHandlers,
	structure,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	fields: Options<ParseMediaFields>;
	structure: StructureState;
}) => {
	return {
		canSkipTracks: () => {
			if (hasAudioTrackHandlers || hasVideoTrackHandlers) {
				return false;
			}

			const keys = Object.keys(
				fields ?? {},
			) as (keyof Options<ParseMediaFields>)[];
			const selectedKeys = keys.filter((k) => fields[k]);
			return !selectedKeys.some((k) =>
				needsTracksForField({field: k, structure: structure.getStructure()}),
			);
		},
	};
};

export type CanSkipTracksState = ReturnType<typeof makeCanSkipTracksState>;
