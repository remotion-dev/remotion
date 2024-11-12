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
	defaultAudioCodec: ConvertMediaAudioCodec | null;
	logLevel: LogLevel;
	container: ConvertMediaContainer;
}) => AudioOperation | Promise<AudioOperation>;

const DEFAULT_BITRATE = 128_000;

export const defaultResolveAudioAction: ResolveAudioActionFn = async ({
	track,
	defaultAudioCodec,
	logLevel,
	container,
}): Promise<AudioOperation> => {
	const bitrate = DEFAULT_BITRATE;
	if (defaultAudioCodec === null) {
		throw new Error(
			'No default video codec provided to convertMedia(). Pass a `audioCodec` parameter to set one.',
		);
	}

	const canCopy = canCopyAudioTrack({
		inputCodec: track.codecWithoutConfig,
		container,
	});

	if (canCopy) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can copy = ${canCopy}, action = copy`,
		);

		return Promise.resolve({type: 'copy'});
	}

	const canReencode = await canReencodeAudioTrack({
		audioCodec: defaultAudioCodec,
		track,
		bitrate,
	});

	if (canReencode) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = reencode`,
		);

		return Promise.resolve({
			type: 'reencode',
			bitrate,
			audioCodec: defaultAudioCodec,
		});
	}

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = drop`,
	);

	// TODO: Make a fail option?
	return Promise.resolve({type: 'drop'});
};
