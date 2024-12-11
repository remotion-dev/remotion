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
		outputContainer,
		rotate,
		inputContainer,
	}): Promise<VideoOperation> => {
		const canCopy = canCopyVideoTrack({
			inputCodec: track.codecWithoutConfig,
			outputContainer,
			inputRotation: track.rotation,
			rotationToApply: rotate,
			inputContainer,
		});

		if (canCopy) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Can copy, therefore copying`,
			);

			return Promise.resolve({type: 'copy'});
		}

		const videoCodec =
			defaultVideoCodec ?? getDefaultVideoCodec({container: outputContainer});

		if (videoCodec === null) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): No default video codec, therefore dropping`,
			);
			return Promise.resolve({type: 'drop'});
		}

		const canReencode = await canReencodeVideoTrack({
			videoCodec,
			track,
		});

		if (canReencode) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (video): Cannot copy, but re-enconde, therefore re-encoding`,
			);

			return Promise.resolve({
				type: 'reencode',
				videoCodec,
				rotation: rotate - track.rotation,
			});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (video): Can neither copy nor re-encode, therefore failing`,
		);

		return Promise.resolve({type: 'fail'});
	};
