import {MediaParserInternals} from '@remotion/media-parser';
import {canCopyAudioTrack} from './can-copy-audio-track';
import {canReencodeAudioTrack} from './can-reencode-audio-track';
import type {
	AudioOperation,
	ConvertMediaOnAudioTrackHandler,
} from './on-audio-track-handler';

const DEFAULT_BITRATE = 128_000;

export const defaultOnAudioTrackHandler: ConvertMediaOnAudioTrackHandler =
	async ({
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
			MediaParserInternals.Log.verbose(
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
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = reencode`,
			);

			return Promise.resolve({
				type: 'reencode',
				bitrate,
				audioCodec: defaultAudioCodec,
			});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can re-encode = ${canReencode}, can copy = ${canCopy}, action = drop`,
		);

		return Promise.resolve({type: 'fail'});
	};
