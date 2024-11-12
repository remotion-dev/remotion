import {MediaParserInternals} from '@remotion/media-parser';
import {canCopyVideoTrack} from './can-copy-video-track';
import {canReencodeVideoTrack} from './can-reencode-video-track';
import {getDefaultVideoCodec} from './get-default-video-codec';
import type {
	ConvertMediaOnVideoTrackHandler,
	VideoOperation,
} from './on-video-track-handler';

export const defaultOnVideoTrackHandler: ConvertMediaOnVideoTrackHandler =
	async ({
		track,
		defaultVideoCodec,
		logLevel,
		container,
	}): Promise<VideoOperation> => {
		const canCopy = canCopyVideoTrack({
			inputCodec: track.codecWithoutConfig,
			container,
		});

		if (canCopy) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Can copy, therefore copying`,
			);

			return Promise.resolve({type: 'copy'});
		}

		const videoCodec = defaultVideoCodec ?? getDefaultVideoCodec({container});

		const canReencode = await canReencodeVideoTrack({
			videoCodec,
			track,
		});

		if (canReencode) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`,
			);

			return Promise.resolve({type: 'reencode', videoCodec});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can neither copy nor re-encode, therefore failing`,
		);

		return Promise.resolve({type: 'fail'});
	};
