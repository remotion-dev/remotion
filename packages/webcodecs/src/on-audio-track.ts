import {
	type MediaParserLogLevel,
	type MediaParserOnAudioTrack,
} from '@remotion/media-parser';
import {canCopyAudioTrack} from './can-copy-audio-track';
import type {ConvertMediaOnAudioData} from './convert-media';
import {copyAudioTrack} from './copy-audio-track';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {defaultOnAudioTrackHandler} from './default-on-audio-track-handler';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaContainer} from './get-available-containers';
import {getDefaultAudioCodec} from './get-default-audio-codec';
import type {ConvertMediaOnAudioTrackHandler} from './on-audio-track-handler';
import {reencodeAudioTrack} from './reencode-audio-track';
import type {ConvertMediaProgressFn} from './throttled-state-update';
import type {WebCodecsController} from './webcodecs-controller';

export const makeAudioTrackHandler =
	({
		state,
		defaultAudioCodec: audioCodec,
		controller,
		abortConversion,
		onMediaStateUpdate,
		onAudioTrack,
		logLevel,
		outputContainer,
		onAudioData,
		progressTracker,
	}: {
		state: MediaFn;
		defaultAudioCodec: ConvertMediaAudioCodec | null;
		controller: WebCodecsController;
		abortConversion: (errCause: Error) => void;
		onMediaStateUpdate: null | ConvertMediaProgressFn;
		onAudioTrack: ConvertMediaOnAudioTrackHandler | null;
		logLevel: MediaParserLogLevel;
		outputContainer: ConvertMediaContainer;
		onAudioData: ConvertMediaOnAudioData | null;
		progressTracker: ProgressTracker;
	}): MediaParserOnAudioTrack =>
	async ({track, container: inputContainer}) => {
		const canCopyTrack = canCopyAudioTrack({
			inputCodec: track.codecEnum,
			outputContainer,
			inputContainer,
			outputAudioCodec: audioCodec,
		});

		const audioOperation = await (onAudioTrack ?? defaultOnAudioTrackHandler)({
			defaultAudioCodec:
				audioCodec ?? getDefaultAudioCodec({container: outputContainer}),
			track,
			logLevel,
			outputContainer,
			inputContainer,
			canCopyTrack,
		});

		if (audioOperation.type === 'drop') {
			return null;
		}

		if (audioOperation.type === 'fail') {
			throw new Error(
				`Audio track with ID ${track.trackId} resolved with {"type": "fail"}. This could mean that this audio track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`,
			);
		}

		if (audioOperation.type === 'copy') {
			return copyAudioTrack({
				logLevel,
				onMediaStateUpdate,
				state,
				track,
				progressTracker,
			});
		}

		return reencodeAudioTrack({
			abortConversion,
			controller,
			logLevel,
			onMediaStateUpdate,
			audioOperation,
			onAudioData,
			state,
			track,
			progressTracker,
		});
	};
