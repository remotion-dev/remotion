import {MediaParserInternals} from '@remotion/media-parser';
import {canCopyVideoTrack} from './can-copy-video-track';
import {canReencodeVideoTrack} from './can-reencode-video-track';
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
			MediaParserInternals.Log.verbose(
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
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`,
			);

			return Promise.resolve({type: 'reencode', videoCodec: defaultVideoCodec});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can neither copy nor re-encode, therefore dropping`,
		);

		return Promise.resolve({type: 'fail'});
	};
