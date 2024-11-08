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
	audioDecoderConfig: AudioDecoderConfig | null;
	audioEncoderConfig: AudioEncoderConfig | null;
	track: AudioTrack;
	audioCodec: ConvertMediaAudioCodec;
	logLevel: LogLevel;
}) => AudioOperation | Promise<AudioOperation>;

export const defaultResolveAudioAction: ResolveAudioActionFn = ({
	audioDecoderConfig,
	audioEncoderConfig,
	track,
	audioCodec,
	logLevel,
}): Promise<AudioOperation> => {
	const canReencode = Boolean(audioDecoderConfig && audioEncoderConfig);
	const canCopy = canCopyAudioTrack(track.codecWithoutConfig, audioCodec);

	if (canCopy) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = copy`,
		);

		return Promise.resolve({type: 'copy'});
	}

	if (canReencode) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = reencode`,
		);

		return Promise.resolve({type: 'reencode'});
	}

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = drop`,
	);

	// TODO: Make a fail option?
	return Promise.resolve({type: 'drop'});
};
