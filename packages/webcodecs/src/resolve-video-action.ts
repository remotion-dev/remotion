import type {
	LogLevel,
	MediaParserVideoCodec,
	VideoTrack,
} from '@remotion/media-parser';
import {canReencodeVideoTrack} from './can-reencode-video-track';
import type {ConvertMediaVideoCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';
import {Log} from './log';

export type VideoOperation =
	| {type: 'reencode'; videoCodec: ConvertMediaVideoCodec}
	| {type: 'copy'}
	| {type: 'drop'};

const canCopyVideoTrack = ({
	inputCodec,
	outputCodec,
	container,
}: {
	inputCodec: MediaParserVideoCodec;
	outputCodec: ConvertMediaVideoCodec;
	container: ConvertMediaContainer;
}) => {
	if (outputCodec === 'vp8') {
		return inputCodec === 'vp8' && container === 'webm';
	}

	if (outputCodec === 'vp9') {
		return inputCodec === 'vp9' && container === 'webm';
	}

	throw new Error(`Unhandled codec: ${outputCodec satisfies never}`);
};

export type ResolveVideoActionFn = (options: {
	videoCodec: ConvertMediaVideoCodec;
	track: VideoTrack;
	logLevel: LogLevel;
	container: ConvertMediaContainer;
}) => VideoOperation | Promise<VideoOperation>;

export const defaultResolveVideoAction: ResolveVideoActionFn = async ({
	track,
	videoCodec,
	logLevel,
	container,
}): Promise<VideoOperation> => {
	const canCopy = canCopyVideoTrack({
		inputCodec: track.codecWithoutConfig,
		outputCodec: videoCodec,
		container,
	});

	if (canCopy) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can copy, therefore copying`,
		);

		return Promise.resolve({type: 'copy'});
	}

	const canReencode = await canReencodeVideoTrack({videoCodec, track});

	if (canReencode) {
		Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`,
		);

		return Promise.resolve({type: 'reencode', videoCodec});
	}

	Log.verbose(
		logLevel,
		`Track ${track.trackId} (video): Can neither copy nor re-encode, therefore dropping`,
	);

	// TODO: Make a fail option?
	return Promise.resolve({type: 'drop'});
};
