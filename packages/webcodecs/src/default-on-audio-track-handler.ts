import {MediaParserInternals} from '@remotion/media-parser';
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
		canCopyTrack,
	}): Promise<AudioOperation> => {
		const bitrate = DEFAULT_BITRATE;

		if (canCopyTrack) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (audio): Can copy track, therefore copying`,
			);

			return Promise.resolve({type: 'copy'});
		}

		// The idea is that for example for GIFs, we will return defaultAudioCodec = null
		if (defaultAudioCodec === null) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (audio): Container does not support audio, dropping audio`,
			);

			return Promise.resolve({type: 'drop'});
		}

		const canReencode = await canReencodeAudioTrack({
			audioCodec: defaultAudioCodec,
			track,
			bitrate,
		});

		if (canReencode) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (audio): Cannot copy, but re-encode, therefore re-encoding`,
			);

			return Promise.resolve({
				type: 'reencode',
				bitrate,
				audioCodec: defaultAudioCodec,
			});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can neither re-encode nor copy, failing render`,
		);

		return Promise.resolve({type: 'fail'});
	};
