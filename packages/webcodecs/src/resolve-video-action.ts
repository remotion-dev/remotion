import type {
	LogLevel,
	MediaParserVideoCodec,
	VideoTrack,
} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './codec-id';
import {Log} from './log';

export type VideoOperation = 'reencode' | 'copy' | 'drop';

const canCopyVideoTrack = (
	inputCodec: MediaParserVideoCodec,
	outputCodec: ConvertMediaVideoCodec,
) => {
	if (outputCodec === 'vp8') {
		return inputCodec === 'vp8';
	}

	if (outputCodec === 'vp9') {
		return inputCodec === 'vp9';
	}

	throw new Error(`Unhandled codec: ${outputCodec satisfies never}`);
};

export type ResolveVideoActionFn = (options: {
	canReencode: boolean;
	canCopy: boolean;
}) => VideoOperation | Promise<VideoOperation>;

export const defaultResolveVideoAction: ResolveVideoActionFn = ({
	canReencode,
	canCopy,
}) => {
	if (canCopy) {
		return 'copy';
	}

	if (canReencode) {
		return 'reencode';
	}

	// TODO: Make a fail option?
	return 'drop';
};

export const resolveVideoAction = async ({
	videoDecoderConfig,
	videoEncoderConfig,
	track,
	videoCodec,
	resolverFunction,
	logLevel,
}: {
	videoDecoderConfig: VideoDecoderConfig | null;
	videoEncoderConfig: VideoEncoderConfig | null;
	videoCodec: ConvertMediaVideoCodec;
	track: VideoTrack;
	resolverFunction: ResolveVideoActionFn;
	logLevel: LogLevel;
}): Promise<VideoOperation> => {
	const canReencode = Boolean(videoDecoderConfig && videoEncoderConfig);
	const canCopy = canCopyVideoTrack(track.codecWithoutConfig, videoCodec);

	const resolved = await resolverFunction({
		canReencode,
		canCopy,
	});
	Log.verbose(
		logLevel,
		`Track ${track.trackId} (video): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = ${resolved}`,
	);

	return resolved;
};
