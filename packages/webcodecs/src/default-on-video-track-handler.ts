import {MediaParserInternals} from '@remotion/media-parser';
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
		rotate,
		canCopyTrack,
		resizeOperation,
	}): Promise<VideoOperation> => {
		if (canCopyTrack) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Can copy, therefore copying`,
			);

			return Promise.resolve({type: 'copy'});
		}

		if (defaultVideoCodec === null) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Is audio container, therefore dropping video`,
			);
			return Promise.resolve({type: 'drop'});
		}

		const canReencode = await canReencodeVideoTrack({
			videoCodec: defaultVideoCodec,
			track,
			resizeOperation,
			rotate,
		});

		if (canReencode) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`,
			);

			return Promise.resolve({
				type: 'reencode',
				videoCodec: defaultVideoCodec,
				rotate: rotate - track.rotation,
				resize: resizeOperation,
			});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can neither copy nor re-encode, therefore failing`,
		);

		return Promise.resolve({type: 'fail'});
	};
