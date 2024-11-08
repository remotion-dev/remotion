import type {
	LogLevel,
	MediaParserVideoCodec,
	VideoTrack,
} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './codec-id';
import {Log} from './log';

export type VideoOperation =
	| {type: 'reencode'}
	| {type: 'copy'}
	| {type: 'drop'};

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
	videoDecoderConfig: VideoDecoderConfig | null;
	videoEncoderConfig: VideoEncoderConfig | null;
	videoCodec: ConvertMediaVideoCodec;
	track: VideoTrack;
	logLevel: LogLevel;
}) => VideoOperation | Promise<VideoOperation>;

export const defaultResolveVideoAction: ResolveVideoActionFn = ({
	videoDecoderConfig,
	videoEncoderConfig,
	track,
	videoCodec,
	logLevel,
}): Promise<VideoOperation> => {
	const canReencode = Boolean(videoDecoderConfig && videoEncoderConfig);
	const canCopy = canCopyVideoTrack(track.codecWithoutConfig, videoCodec);

	if (canCopy) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = copy`,
		);

		return Promise.resolve({type: 'copy'});
	}

	if (canReencode) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = reencode`,
		);

		return Promise.resolve({type: 'reencode'});
	}

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (video): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = drop`,
	);

	// TODO: Make a fail option?
	return Promise.resolve({type: 'drop'});
};
