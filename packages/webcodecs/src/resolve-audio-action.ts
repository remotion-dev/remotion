import type {
	AudioTrack,
	LogLevel,
	MediaParserAudioCodec,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './codec-id';
import {Log} from './log';

export type AudioOperation =
	| {type: 'reencode'}
	| {type: 'copy'}
	| {type: 'drop'};

const canCopyAudioTrack = (
	inputCodec: MediaParserAudioCodec,
	outputCodec: ConvertMediaAudioCodec,
) => {
	if (outputCodec === 'opus') {
		return inputCodec === 'opus';
	}

	throw new Error(`Unhandled codec: ${outputCodec satisfies never}`);
};

export type ResolveAudioActionFn = (options: {
	canReencode: boolean;
	canCopy: boolean;
}) => AudioOperation | Promise<AudioOperation>;

export const defaultResolveAudioAction: ResolveAudioActionFn = ({
	canReencode,
	canCopy,
}) => {
	if (canCopy) {
		return {type: 'copy'};
	}

	if (canReencode) {
		return {type: 'reencode'};
	}

	// TODO: Make a fail option?
	return {type: 'drop'};
};

export const resolveAudioAction = async ({
	audioDecoderConfig,
	audioEncoderConfig,
	track,
	audioCodec,
	resolverFunction,
	logLevel,
}: {
	audioDecoderConfig: AudioDecoderConfig | null;
	audioEncoderConfig: AudioEncoderConfig | null;
	track: AudioTrack;
	audioCodec: ConvertMediaAudioCodec;
	resolverFunction: ResolveAudioActionFn;
	logLevel: LogLevel;
}): Promise<AudioOperation> => {
	const canReencode = Boolean(audioDecoderConfig && audioEncoderConfig);
	const canCopy = canCopyAudioTrack(track.codecWithoutConfig, audioCodec);

	const resolved = await resolverFunction({
		canReencode,
		canCopy,
	});

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = ${resolved}`,
	);

	return resolved;
};
