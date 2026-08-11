import type {RefObject} from 'react';
import {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {useBufferUntilFirstFrame} from './buffer-until-first-frame.js';
import {BufferingContextReact, useIsPlayerBuffering} from './buffering.js';
import {getMediaSyncAction} from './get-media-sync-action.js';
import {useLogLevel, useMountTime} from './log-level-context.js';
import {Log} from './log.js';
import {useCurrentTimeOfMediaTagWithUpdateTimeStamp} from './media-tag-current-time-timestamp.js';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error.js';
import {playbackLogging} from './playback-logging.js';
import {seek} from './seek.js';
import {
	usePlayingState,
	usePlaybackRate,
	useTimelinePosition,
} from './timeline-position-state.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useMediaBuffering} from './use-media-buffering.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
import {useRequestVideoCallbackTime} from './use-request-video-callback-time.js';
import {useVideoConfig} from './use-video-config.js';
import {getMediaTime} from './video/get-current-time.js';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media.js';

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
	const [playing] = usePlayingState();
	const buffering = useContext(BufferingContextReact);
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const lastSeekDueToShift = useRef<number | null>(null);
	const lastSeek = useRef<number | null>(null);
	const logLevel = useLogLevel();
	const mountTime = useMountTime();

	if (!buffering) {
		throw new Error(
			'useMediaPlayback must be used inside a <BufferingContext>',
		);
	}

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

	const {bufferUntilFirstFrame, isBuffering} = useBufferUntilFirstFrame({
		mediaRef,
		mediaType,
		onVariableFpsVideoDetected,
		pauseWhenBuffering,
		logLevel,
		mountTime,
	});

	const playbackRate = localPlaybackRate * globalPlaybackRate;

	const acceptableTimeShiftButLessThanDuration = (() => {
		// In Safari, it seems to lag behind mostly around ~0.4 seconds
		const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_NORMAL_PLAYBACK = 0.45;

		// If there is amplification, the acceptable timeshift is higher
		const DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION =
			DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_NORMAL_PLAYBACK + 0.2;

		const defaultAcceptableTimeshift =
			DEFAULT_ACCEPTABLE_TIMESHIFT_WITH_AMPLIFICATION;
		// For short audio, a lower acceptable time shift is used
		if (mediaRef.current?.duration) {
			return Math.min(
				mediaRef.current.duration,
				acceptableTimeshift ?? defaultAcceptableTimeshift,
			);
		}

		return acceptableTimeshift ?? defaultAcceptableTimeshift;
	})();

	const isPlayerBuffering = useIsPlayerBuffering(buffering);

	useEffect(() => {
		if (mediaRef.current?.paused) {
			return;
		}

		if (!playing) {
			playbackLogging({
				logLevel,
				tag: 'pause',
				message: `Pausing ${mediaRef.current?.src} because ${isPremounting ? 'media is premounting' : isPostmounting ? 'media is postmounting' : 'Player is not playing'}`,
				mountTime,
			});
			mediaRef.current?.pause();
			return;
		}

		const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();

		const playerBufferingNotStateButLive = buffering.buffering.current;
		if (playerBufferingNotStateButLive && !isMediaTagBufferingOrStalled) {
			playbackLogging({
				logLevel,
				tag: 'pause',
				message: `Pausing ${mediaRef.current?.src} because player is buffering but media tag is not`,
				mountTime,
			});
			mediaRef.current?.pause();
		}
	}, [
		isBuffering,
		isMediaTagBuffering,
		buffering,
		isPlayerBuffering,
		isPremounting,
		logLevel,
		mediaRef,
		mediaType,
		mountTime,
		playing,
		isPostmounting,
	]);

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

	useEffect(() => {
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
			mediaTagBufferingOrStalled: isMediaTagBuffering || isBuffering(),
			playerBuffering: buffering.buffering.current,
			absoluteFrame,
			onlyWarnForMediaSeekingError,
			isPremounting,
			isPostmounting,
			pauseWhenBuffering,
		});

		if (action.type === 'none') {
			return;
		}

		if (action.type === 'seek-due-to-shift') {
			lastSeek.current = seek({
				mediaRef: current,
				time: action.shouldBeTime,
				logLevel,
				why: action.why,
				mountTime,
			});
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
				lastSeek.current = seek({
					mediaRef: current,
					time: action.shouldBeTime,
					logLevel,
					why: action.why,
					mountTime,
				});
			}

			return;
		}

		// action.type === 'play-and-seek'
		if (action.why !== null) {
			lastSeek.current = seek({
				mediaRef: current,
				time: action.shouldBeTime,
				logLevel,
				why: action.why,
				mountTime,
			});
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
	}, [
		absoluteFrame,
		acceptableTimeShiftButLessThanDuration,
		bufferUntilFirstFrame,
		buffering.buffering,
		rvcCurrentTime,
		logLevel,
		desiredUnclampedTime,
		isBuffering,
		isMediaTagBuffering,
		mediaRef,
		mediaType,
		onlyWarnForMediaSeekingError,
		playbackRate,
		playing,
		src,
		onAutoPlayError,
		isPremounting,
		isPostmounting,
		pauseWhenBuffering,
		mountTime,
		mediaTagCurrentTime,
		env.isPlayer,
	]);
};
