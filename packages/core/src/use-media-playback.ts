import type {RefObject} from 'react';
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {useBufferUntilFirstFrame} from './buffer-until-first-frame.js';
import {
	getMediaSyncAction,
	type MediaSyncAction,
} from './get-media-sync-action.js';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {Log} from './log.js';
import {useCurrentTimeOfMediaTagWithUpdateTimeStamp} from './media-tag-current-time-timestamp.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {playbackLogging} from './playback-logging.js';
import {seek} from './seek.js';
import {
	usePlaying,
	usePlaybackRate,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useBuffering} from './use-buffering.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useMediaBuffering} from './use-media-buffering.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useRequestVideoCallbackTime} from './use-request-video-callback-time.js';
import {useVideoConfig} from './use-video-config.js';
import {getMediaTime} from './video/get-current-time.js';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media.js';

// In Safari, amplified media can lag behind by around 0.4 seconds.
const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION = 0.65;

type PauseReason = 'not-playing' | 'buffering';

const getPauseReason = ({
	playing,
	buffering,
	mediaTagBuffering,
}: {
	playing: boolean;
	buffering: boolean;
	mediaTagBuffering: boolean;
}): PauseReason | null => {
	if (!playing) {
		return 'not-playing';
	}

	return buffering && !mediaTagBuffering ? 'buffering' : null;
};

const getPauseReasonText = ({
	pauseReason,
	isPremounting,
	isPostmounting,
}: {
	pauseReason: PauseReason;
	isPremounting: boolean;
	isPostmounting: boolean;
}) => {
	if (pauseReason === 'buffering') {
		return 'player is buffering but media tag is not';
	}

	if (isPremounting) {
		return 'media is premounting';
	}

	return isPostmounting ? 'media is postmounting' : 'Player is not playing';
};

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
	preservePitch = true,
	onlyWarnForMediaSeekingError,
	acceptableTimeshift,
	pauseWhenBuffering,
	isPremounting,
	isPostmounting,
	onAutoPlayError,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	preservePitch: boolean | undefined;
	onlyWarnForMediaSeekingError: boolean;
	acceptableTimeshift: number | null;
	pauseWhenBuffering: boolean;
	isPremounting: boolean;
	isPostmounting: boolean;
	onAutoPlayError: null | (() => void);
}) => {
	const {playbackRate: globalPlaybackRate} = usePlaybackRate();
	const frame = useCurrentFrame();
	const absoluteFrame = useTimelinePosition();
	const playing = usePlaying();
	const buffering = useBuffering();
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const lastSeekDueToShift = useRef<number | null>(null);
	const lastSeek = useRef<number | null>(null);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	const isVariableFpsVideoMap = useRef<Record<string, boolean>>({});

	const onVariableFpsVideoDetected = useCallback(() => {
		if (!src) {
			return;
		}

		if (isVariableFpsVideoMap.current[src]) {
			return;
		}

		Log.verbose(
			{logLevel, tag: null},
			`Detected ${src} as a variable FPS video. Disabling buffering while seeking.`,
		);

		isVariableFpsVideoMap.current[src] = true;
	}, [logLevel, src]);

	const rvcCurrentTime = useRequestVideoCallbackTime({
		mediaRef,
		mediaType,
		lastSeek,
		onVariableFpsVideoDetected,
	});

	const mediaTagCurrentTime =
		useCurrentTimeOfMediaTagWithUpdateTimeStamp(mediaRef);

	const desiredUnclampedTime = getMediaTime({
		frame,
		playbackRate: localPlaybackRate,
		startFrom: -mediaStartsAt,
		fps,
	});

	const isMediaTagBuffering = useMediaBuffering({
		element: mediaRef,
		shouldBuffer: pauseWhenBuffering,
		isPremounting,
		isPostmounting,
		logLevel,
		mountTime,
		src: src ?? null,
	});

	const {bufferUntilFirstFrame, isBuffering: isBufferingUntilFirstFrame} =
		useBufferUntilFirstFrame({
			mediaRef,
			mediaType,
			onVariableFpsVideoDetected,
			pauseWhenBuffering,
			logLevel,
			mountTime,
		});

	const playbackRate = localPlaybackRate * globalPlaybackRate;

	const acceptableTimeShiftButLessThanDuration = (() => {
		// For short audio, a lower acceptable time shift is used
		if (mediaRef.current?.duration) {
			return Math.min(
				mediaRef.current.duration,
				acceptableTimeshift ?? DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION,
			);
		}

		return (
			acceptableTimeshift ?? DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION
		);
	})();

	const env = useRemotionEnvironment();

	// This must be a useLayoutEffect, because afterwards, useVolume() looks at the playbackRate
	// and it is also in a useLayoutEffect.
	useLayoutEffect(() => {
		const playbackRateToSet = Math.max(0, playbackRate);
		if (
			mediaRef.current &&
			mediaRef.current.playbackRate !== playbackRateToSet
		) {
			mediaRef.current.playbackRate = playbackRateToSet;
		}

		if (mediaRef.current && mediaRef.current.preservesPitch !== preservePitch) {
			mediaRef.current.preservesPitch = preservePitch;
		}
	}, [mediaRef, playbackRate, preservePitch]);

	const pauseMedia = useCallback(
		(
			current: HTMLAudioElement | HTMLVideoElement,
			pauseReason: PauseReason | null,
		) => {
			if (current.paused || pauseReason === null) {
				return;
			}

			playbackLogging({
				logLevel,
				tag: 'pause',
				message: `Pausing ${current.src} because ${getPauseReasonText({
					pauseReason,
					isPremounting,
					isPostmounting,
				})}`,
				mountTime,
			});
			current.pause();
		},
		[isPostmounting, isPremounting, logLevel, mountTime],
	);

	const executeMediaSyncAction = useCallback(
		(current: HTMLAudioElement | HTMLVideoElement, action: MediaSyncAction) => {
			const seekTo = (time: number, why: string) => {
				lastSeek.current = seek({
					mediaRef: current,
					time,
					logLevel,
					why,
					mountTime,
				});
			};

			if (action.type === 'none') {
				return;
			}

			if (action.type === 'seek-due-to-shift') {
				seekTo(action.shouldBeTime, action.why);
				lastSeekDueToShift.current = lastSeek.current;

				if (action.bufferUntilFirstFrame) {
					bufferUntilFirstFrame(action.shouldBeTime);
				}

				if (action.playReason !== null) {
					playAndHandleNotAllowedError({
						mediaRef,
						mediaType,
						onAutoPlayError,
						logLevel,
						mountTime,
						reason: action.playReason,
						isPlayer: env.isPlayer,
					});
				}

				if (action.warnAboutNonSeekable) {
					warnAboutNonSeekableMedia(current, 'console-error');
				}

				return;
			}

			if (action.type === 'seek-if-not-playing') {
				if (action.why !== null) {
					seekTo(action.shouldBeTime, action.why);
				}

				return;
			}

			if (action.why !== null) {
				seekTo(action.shouldBeTime, action.why);
			}

			playAndHandleNotAllowedError({
				mediaRef,
				mediaType,
				onAutoPlayError,
				logLevel,
				mountTime,
				reason: action.playReason,
				isPlayer: env.isPlayer,
			});
			if (action.bufferUntilFirstFrame) {
				bufferUntilFirstFrame(action.shouldBeTime);
			}
		},
		[
			bufferUntilFirstFrame,
			env.isPlayer,
			logLevel,
			mediaRef,
			mediaType,
			mountTime,
			onAutoPlayError,
		],
	);

	const synchronizeMedia = useCallback(() => {
		const tagName = mediaType === 'audio' ? '<Html5Audio>' : '<Html5Video>';
		if (!mediaRef.current) {
			throw new Error(`No ${mediaType} ref found`);
		}

		if (!src) {
			throw new Error(
				`No 'src' attribute was passed to the ${tagName} element.`,
			);
		}

		const {current} = mediaRef;
		const isMediaTagBufferingOrStalled =
			isMediaTagBuffering || isBufferingUntilFirstFrame();
		const pauseReason = getPauseReason({
			playing,
			buffering,
			mediaTagBuffering: isMediaTagBufferingOrStalled,
		});

		pauseMedia(current, pauseReason);

		const action = getMediaSyncAction({
			duration: current.duration,
			currentTime: current.currentTime,
			paused: current.paused,
			ended: current.ended,
			desiredUnclampedTime,
			mediaTagTime: mediaTagCurrentTime.current.time,
			mediaTagLastUpdate: mediaTagCurrentTime.current.lastUpdate,
			rvcTime: rvcCurrentTime.current?.time ?? null,
			rvcLastUpdate: rvcCurrentTime.current?.lastUpdate ?? null,
			isVariableFpsVideo: Boolean(isVariableFpsVideoMap.current[src]),
			acceptableTimeShift: acceptableTimeShiftButLessThanDuration,
			lastSeekDueToShift: lastSeekDueToShift.current,
			playing,
			playbackRate,
			mediaTagBufferingOrStalled: isMediaTagBufferingOrStalled,
			playerBuffering: buffering,
			absoluteFrame,
			onlyWarnForMediaSeekingError,
			isPremounting,
			isPostmounting,
			pauseWhenBuffering,
		});

		executeMediaSyncAction(current, action);
	}, [
		absoluteFrame,
		acceptableTimeShiftButLessThanDuration,
		rvcCurrentTime,
		desiredUnclampedTime,
		executeMediaSyncAction,
		isBufferingUntilFirstFrame,
		isMediaTagBuffering,
		mediaRef,
		mediaType,
		onlyWarnForMediaSeekingError,
		playbackRate,
		buffering,
		playing,
		src,
		isPremounting,
		isPostmounting,
		pauseWhenBuffering,
		mediaTagCurrentTime,
		pauseMedia,
	]);

	useEffect(() => {
		synchronizeMedia();
	}, [synchronizeMedia]);
};
