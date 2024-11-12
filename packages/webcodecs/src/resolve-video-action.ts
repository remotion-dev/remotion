import type {LogLevel, VideoTrack} from '@remotion/media-parser';
import {canCopyVideoTrack} from './can-copy-video-track';
import {canReencodeVideoTrack} from './can-reencode-video-track';
import type {ConvertMediaVideoCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';
import {Log} from './log';

export type VideoOperation =
	| {type: 'reencode'; videoCodec: ConvertMediaVideoCodec}
	| {type: 'copy'}
	| {type: 'drop'}
	| {type: 'fail'};

export type ResolveVideoActionFn = (options: {
	defaultVideoCodec: ConvertMediaVideoCodec | null;
	track: VideoTrack;
	logLevel: LogLevel;
	container: ConvertMediaContainer;
}) => VideoOperation | Promise<VideoOperation>;

export const defaultResolveVideoAction: ResolveVideoActionFn = async ({
	track,
	defaultVideoCodec,
	logLevel,
	container,
}): Promise<VideoOperation> => {
	if (defaultVideoCodec === null) {
		throw new Error(
			'No default video codec provided to convertMedia(). Pass a `videoCodec` parameter to set one.',
		);
	}

	const canCopy = canCopyVideoTrack({
		inputCodec: track.codecWithoutConfig,
		container,
	});

	if (canCopy) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can copy, therefore copying`,
		);

		return Promise.resolve({type: 'copy'});
	}

	const canReencode = await canReencodeVideoTrack({
		videoCodec: defaultVideoCodec,
		track,
	});

	if (canReencode) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`,
		);

		return Promise.resolve({type: 'reencode', videoCodec: defaultVideoCodec});
	}

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (video): Can neither copy nor re-encode, therefore dropping`,
	);

	return Promise.resolve({type: 'fail'});
};
