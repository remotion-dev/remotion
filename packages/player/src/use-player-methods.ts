import type {SyntheticEvent} from 'react';
import {useCallback, useContext, useMemo, useRef} from 'react';
import {Internals, useRemotionEnvironment} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context.js';
import type {PlayerEmitter} from './event-emitter.js';

export type UsePlayerMethods = {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	emitter: PlayerEmitter;
	play: (e?: SyntheticEvent | PointerEvent) => void;
	pause: () => void;
	pauseAndReturnToPlayStart: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
	isPlaying: () => boolean;
	isBuffering: () => boolean;
	toggle: (e?: SyntheticEvent | PointerEvent) => void;
};

export const usePlayerMethods = (): UsePlayerMethods => {
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const {
		setPlaying,
		frameRef,
		isPlaying: readIsPlaying,
	} = useContext(Internals.SetTimelineContext);
	const environment = useRemotionEnvironment();
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);
	const playStart = useRef(0);
	const fallbackFrame = useRef<number | null>(null);

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
	}

	const bufferingContext = useContext(Internals.BufferingContextReact);
	if (!bufferingContext) {
		throw new Error(
			'Missing the buffering context. Most likely you have a Remotion version mismatch.',
		);
	}

	const getCurrentFrame = useCallback(() => {
		if (!video) {
			return (
				fallbackFrame.current ??
				(typeof window === 'undefined'
					? 0
					: (window.remotion_initialFrame ?? 0))
			);
		}

		const unclamped =
			frameRef.current[video.id] ??
			(environment.isPlayer
				? 0
				: Internals.Timeline.getFrameForComposition(video.id));

		return Internals.Timeline.clampFrameToCompositionRange(
			unclamped,
			video.durationInFrames,
		);
	}, [environment.isPlayer, frameRef, video]);

	const seek = useCallback(
		(newFrame: number) => {
			const frameToSeekTo = config
				? Internals.TimelinePosition.clampFrameToCompositionRange(
						newFrame,
						config.durationInFrames,
					)
				: Math.max(0, newFrame);

			fallbackFrame.current = frameToSeekTo;

			if (video?.id) {
				if (frameRef.current[video.id] !== frameToSeekTo) {
					frameRef.current = {
						...frameRef.current,
						[video.id]: frameToSeekTo,
					};
				}

				setTimelinePosition((currentFrames) =>
					currentFrames[video.id] === frameToSeekTo
						? currentFrames
						: {...currentFrames, [video.id]: frameToSeekTo},
				);
			}

			emitter.dispatchSeek(frameToSeekTo);
		},
		[config, emitter, frameRef, setTimelinePosition, video?.id],
	);

	const play = useCallback(
		(_e?: SyntheticEvent | PointerEvent) => {
			if (readIsPlaying()) {
				return;
			}

			const lastFrameForPlayback = (config?.durationInFrames ?? 1) - 1;
			if (getCurrentFrame() === lastFrameForPlayback) {
				seek(0);
			}

			setPlaying(true);
			playStart.current = getCurrentFrame();
		},
		[
			config?.durationInFrames,
			getCurrentFrame,
			readIsPlaying,
			seek,
			setPlaying,
		],
	);

	const pause = useCallback(() => {
		if (readIsPlaying()) {
			setPlaying(false);
		}
	}, [readIsPlaying, setPlaying]);

	const pauseAndReturnToPlayStart = useCallback(() => {
		if (readIsPlaying()) {
			setPlaying(false);
			fallbackFrame.current = playStart.current;
			if (config) {
				frameRef.current = {
					...frameRef.current,
					[config.id]: playStart.current,
				};
				setTimelinePosition((currentFrames) => ({
					...currentFrames,
					[config.id]: playStart.current,
				}));
				emitter.dispatchPause();
			}
		}
	}, [
		config,
		emitter,
		frameRef,
		readIsPlaying,
		setPlaying,
		setTimelinePosition,
	]);

	const videoId = video?.id;
	const lastFrame = (config?.durationInFrames ?? 1) - 1;

	const frameBack = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (readIsPlaying()) {
				return;
			}

			const previousFrame =
				frameRef.current[videoId] ?? window.remotion_initialFrame ?? 0;
			const newFrame = Math.max(0, previousFrame - frames);
			if (previousFrame === newFrame) {
				return;
			}

			frameRef.current = {
				...frameRef.current,
				[videoId]: newFrame,
			};
			setFrame((currentFrames) =>
				currentFrames[videoId] === newFrame
					? currentFrames
					: {...currentFrames, [videoId]: newFrame},
			);
		},
		[frameRef, readIsPlaying, setFrame, videoId],
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (readIsPlaying()) {
				return;
			}

			const previousFrame =
				frameRef.current[videoId] ?? window.remotion_initialFrame ?? 0;
			const newFrame = Math.min(lastFrame, previousFrame + frames);
			if (previousFrame === newFrame) {
				return;
			}

			frameRef.current = {
				...frameRef.current,
				[videoId]: newFrame,
			};
			setFrame((currentFrames) =>
				currentFrames[videoId] === newFrame
					? currentFrames
					: {...currentFrames, [videoId]: newFrame},
			);
		},
		[frameRef, lastFrame, readIsPlaying, setFrame, videoId],
	);

	const toggle = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (readIsPlaying()) {
				pause();
			} else {
				play(e);
			}
		},
		[pause, play, readIsPlaying],
	);

	const isPlaying = useCallback(() => {
		return readIsPlaying();
	}, [readIsPlaying]);

	const isBuffering = useCallback(() => {
		return bufferingContext.buffering.current;
	}, [bufferingContext.buffering]);

	return useMemo(() => {
		return {
			frameBack,
			frameForward,
			emitter,
			play,
			pause,
			seek,
			getCurrentFrame,
			isPlaying,
			isBuffering,
			pauseAndReturnToPlayStart,
			toggle,
		};
	}, [
		emitter,
		frameBack,
		frameForward,
		getCurrentFrame,
		isBuffering,
		isPlaying,
		pause,
		pauseAndReturnToPlayStart,
		play,
		seek,
		toggle,
	]);
};
