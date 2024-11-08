import type {
	AudioTrack,
	LogLevel,
	MediaParserAudioCodec,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './codec-id';
import {Log} from './log';

export type AudioOperation = 'reencode' | 'copy' | 'drop';

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
		return 'copy';
	}

	if (canReencode) {
		return 'reencode';
	}

	// TODO: Make a fail option?
	return 'drop';
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
