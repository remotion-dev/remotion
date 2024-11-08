import type {AudioTrack, LogLevel} from '@remotion/media-parser';
import {canCopyAudioTrack} from './can-copy-audio-track';
import {canReencodeAudioTrack} from './can-reencode-audio-track';
import type {ConvertMediaAudioCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';
import {Log} from './log';

export type AudioOperation =
	| {type: 'reencode'; bitrate: number; audioCodec: ConvertMediaAudioCodec}
	| {type: 'copy'}
	| {type: 'drop'};

export type ResolveAudioActionFn = (options: {
	track: AudioTrack;
	audioCodec: ConvertMediaAudioCodec;
	logLevel: LogLevel;
	container: ConvertMediaContainer;
}) => AudioOperation | Promise<AudioOperation>;

const DEFAULT_BITRATE = 128_000;

export const defaultResolveAudioAction: ResolveAudioActionFn = async ({
	track,
	audioCodec,
	logLevel,
	container,
}): Promise<AudioOperation> => {
	const bitrate = DEFAULT_BITRATE;
	const canReencode = await canReencodeAudioTrack({
		audioCodec,
		track,
		bitrate,
	});

	const canCopy = canCopyAudioTrack({
		inputCodec: track.codecWithoutConfig,
		outputCodec: audioCodec,
		container,
	});

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

		return Promise.resolve({type: 'reencode', bitrate, audioCodec});
	}

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = drop`,
	);

	// TODO: Make a fail option?
	return Promise.resolve({type: 'drop'});
};
