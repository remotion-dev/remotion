import {MediaParserInternals} from '@remotion/media-parser';
import {canCopyAudioTrack} from './can-copy-audio-track';
import {canReencodeAudioTrack} from './can-reencode-audio-track';
import {getDefaultAudioCodec} from './get-default-audio-codec';
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
		outputContainer,
		inputContainer,
	}): Promise<AudioOperation> => {
		const bitrate = DEFAULT_BITRATE;

		const canCopy = canCopyAudioTrack({
			inputCodec: track.codecWithoutConfig,
			outputContainer,
			inputContainer,
		});

		if (canCopy) {
			MediaParserInternals.Log.verbose(
				logLevel,
				`Track ${track.trackId} (audio): Can copy track, therefore copying`,
			);

			return Promise.resolve({type: 'copy'});
		}

		const audioCodec =
			defaultAudioCodec ?? getDefaultAudioCodec({container: outputContainer});

		const canReencode = await canReencodeAudioTrack({
			audioCodec,
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
				audioCodec,
			});
		}

		MediaParserInternals.Log.verbose(
			logLevel,
			`Track ${track.trackId} (audio): Can neither re-encode nor copy, failing render`,
		);

		return Promise.resolve({type: 'fail'});
	};
