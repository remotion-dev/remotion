import type {
	MediaParserLogLevel,
	MediaParserOnVideoTrack,
} from '@remotion/media-parser';
import {canCopyVideoTrack} from './can-copy-video-track';
import type {ConvertMediaOnVideoFrame} from './convert-media';
import {copyVideoTrack} from './copy-video-track';
import type {MediaFn} from './create/media-fn';
import type {ProgressTracker} from './create/progress-tracker';
import {defaultOnVideoTrackHandler} from './default-on-video-track-handler';
import type {ConvertMediaContainer} from './get-available-containers';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {getDefaultVideoCodec} from './get-default-video-codec';
import type {ConvertMediaOnVideoTrackHandler} from './on-video-track-handler';
import {reencodeVideoTrack} from './reencode-video-track';
import type {ResizeOperation} from './resizing/mode';
import type {ConvertMediaProgressFn} from './throttled-state-update';
import type {WebCodecsController} from './webcodecs-controller';

export const makeVideoTrackHandler =
	({
		state,
		onVideoFrame,
		onMediaStateUpdate,
		abortConversion,
		controller,
		defaultVideoCodec,
		onVideoTrack,
		logLevel,
		outputContainer,
		rotate,
		resizeOperation,
		progressTracker,
	}: {
		state: MediaFn;
		onVideoFrame: null | ConvertMediaOnVideoFrame;
		onMediaStateUpdate: null | ConvertMediaProgressFn;
		abortConversion: (errCause: Error) => void;
		controller: WebCodecsController;
		defaultVideoCodec: ConvertMediaVideoCodec | null;
		onVideoTrack: ConvertMediaOnVideoTrackHandler | null;
		logLevel: MediaParserLogLevel;
		outputContainer: ConvertMediaContainer;
		rotate: number;
		resizeOperation: ResizeOperation | null;
		progressTracker: ProgressTracker;
	}): MediaParserOnVideoTrack =>
	async ({track, container: inputContainer}) => {
		if (
			controller._internals._mediaParserController._internals.signal.aborted
		) {
			throw new Error('Aborted');
		}

		const canCopyTrack = canCopyVideoTrack({
			inputContainer,
			outputContainer,
			rotationToApply: rotate,
			inputTrack: track,
			resizeOperation,
			outputVideoCodec: defaultVideoCodec,
		});

		const videoOperation = await (onVideoTrack ?? defaultOnVideoTrackHandler)({
			track,
			defaultVideoCodec:
				defaultVideoCodec ?? getDefaultVideoCodec({container: outputContainer}),
			logLevel,
			outputContainer,
			rotate,
			inputContainer,
			canCopyTrack,
			resizeOperation,
		});

		if (videoOperation.type === 'drop') {
			return null;
		}

		if (videoOperation.type === 'fail') {
			throw new Error(
				`Video track with ID ${track.trackId} resolved with {"type": "fail"}. This could mean that this video track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`,
			);
		}

		if (videoOperation.type === 'copy') {
			return copyVideoTrack({
				logLevel,
				onMediaStateUpdate,
				state,
				track,
				progressTracker,
			});
		}

		return reencodeVideoTrack({
			videoOperation,
			abortConversion,
			controller,
			logLevel,
			rotate,
			track,
			onVideoFrame,
			state,
			onMediaStateUpdate,
			progressTracker,
		});
	};
