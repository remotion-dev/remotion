import type {Options, ParseMediaFields} from '../options';

const needsTracksField: Record<keyof Options<ParseMediaFields>, boolean> = {
	audioCodec: true,
	container: false,
	dimensions: true,
	durationInSeconds: true,
	slowDurationInSeconds: true,
	slowFps: true,
	fps: true,
	internalStats: false,
	isHdr: true,
	name: false,
	rotation: true,
	size: false,
	structure: true,
	tracks: true,
	unrotatedDimensions: true,
	videoCodec: true,
	metadata: true,
	location: true,
	mimeType: false,
	slowKeyframes: true,
	slowNumberOfFrames: true,
	keyframes: true,
};

export const makeCanSkipTracksState = ({
	hasAudioTrackHandlers,
	fields,
	hasVideoTrackHandlers,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	fields: Options<ParseMediaFields>;
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
			return !selectedKeys.some((k) => needsTracksField[k]);
		},
	};
};

export type CanSkipTracksState = ReturnType<typeof makeCanSkipTracksState>;
