import type {SyntheticEvent} from 'react';
import {useCallback, useContext, useMemo, useRef} from 'react';
import {Internals, useRemotionEnvironment} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context.js';
import type {PlayerEmitter} from './event-emitter.js';
import {getTimelineImperativeContext} from './timeline-imperative-context.js';

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
	const {setPlaying} = useContext(Internals.SetTimelineContext);
	const timelineImperativeContext = useContext(getTimelineImperativeContext());
	const audioContext = useContext(Internals.SharedAudioContext);
	const audioTagsContext = useContext(Internals.SharedAudioTagsContext);
	const environment = useRemotionEnvironment();
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);
	const playStart = useRef(0);
	const fallbackFrame = useRef<number | null>(null);

	if (!timelineImperativeContext) {
		throw new Error(
			'Timeline imperative context is not available. This hook must be used inside a <Player> or the Remotion Studio.',
		);
	}

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
			timelineImperativeContext.frameRef.current[video.id] ??
			(environment.isPlayer
				? 0
				: Internals.Timeline.getFrameForComposition(video.id));

		return Internals.Timeline.clampFrameToCompositionRange(
			unclamped,
			video.durationInFrames,
		);
	}, [environment.isPlayer, timelineImperativeContext, video]);

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
				if (
					timelineImperativeContext.frameRef.current[video.id] !== frameToSeekTo
				) {
					timelineImperativeContext.frameRef.current = {
						...timelineImperativeContext.frameRef.current,
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
		[
			config,
			emitter,
			setTimelinePosition,
			timelineImperativeContext,
			video?.id,
		],
	);

	const play = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (timelineImperativeContext.imperativePlaying.current) {
				return;
			}

			const lastFrameForPlayback = (config?.durationInFrames ?? 1) - 1;
			if (getCurrentFrame() === lastFrameForPlayback) {
				seek(0);
			}

			audioContext?.resume();

			/**
			 * Play silent audio tags to warm them up for autoplay
			 */
			if (audioTagsContext && audioTagsContext.numberOfAudioTags > 0 && e) {
				audioTagsContext.playAllAudios();
			}

			/**
			 * Play audios and videos directly here so they can benefit from
			 * being triggered by a click
			 */
			timelineImperativeContext.audioAndVideoTags.current.forEach((tag) =>
				tag.play('player play() was called and playing audio from a click'),
			);

			timelineImperativeContext.imperativePlaying.current = true;
			setPlaying(true);
			playStart.current = getCurrentFrame();
			emitter.dispatchPlay();
		},
		[
			audioContext,
			audioTagsContext,
			config?.durationInFrames,
			emitter,
			getCurrentFrame,
			seek,
			setPlaying,
			timelineImperativeContext,
		],
	);

	const pause = useCallback(() => {
		if (timelineImperativeContext.imperativePlaying.current) {
			timelineImperativeContext.imperativePlaying.current = false;

			setPlaying(false);
			emitter.dispatchPause();
			audioContext?.suspend();
		}
	}, [audioContext, emitter, setPlaying, timelineImperativeContext]);

	const pauseAndReturnToPlayStart = useCallback(() => {
		if (timelineImperativeContext.imperativePlaying.current) {
			timelineImperativeContext.imperativePlaying.current = false;
			fallbackFrame.current = playStart.current;
			if (config) {
				timelineImperativeContext.frameRef.current = {
					...timelineImperativeContext.frameRef.current,
					[config.id]: playStart.current,
				};
				setTimelinePosition((currentFrames) => ({
					...currentFrames,
					[config.id]: playStart.current,
				}));
				setPlaying(false);
				emitter.dispatchPause();
			}
		}
	}, [
		config,
		emitter,
		setPlaying,
		setTimelinePosition,
		timelineImperativeContext,
	]);

	const videoId = video?.id;
	const lastFrame = (config?.durationInFrames ?? 1) - 1;

	const frameBack = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (timelineImperativeContext.imperativePlaying.current) {
				return;
			}

			const previousFrame =
				timelineImperativeContext.frameRef.current[videoId] ??
				window.remotion_initialFrame ??
				0;
			const newFrame = Math.max(0, previousFrame - frames);
			if (previousFrame === newFrame) {
				return;
			}

			timelineImperativeContext.frameRef.current = {
				...timelineImperativeContext.frameRef.current,
				[videoId]: newFrame,
			};
			setFrame((currentFrames) =>
				currentFrames[videoId] === newFrame
					? currentFrames
					: {...currentFrames, [videoId]: newFrame},
			);
		},
		[setFrame, timelineImperativeContext, videoId],
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (timelineImperativeContext.imperativePlaying.current) {
				return;
			}

			const previousFrame =
				timelineImperativeContext.frameRef.current[videoId] ??
				window.remotion_initialFrame ??
				0;
			const newFrame = Math.min(lastFrame, previousFrame + frames);
			if (previousFrame === newFrame) {
				return;
			}

			timelineImperativeContext.frameRef.current = {
				...timelineImperativeContext.frameRef.current,
				[videoId]: newFrame,
			};
			setFrame((currentFrames) =>
				currentFrames[videoId] === newFrame
					? currentFrames
					: {...currentFrames, [videoId]: newFrame},
			);
		},
		[lastFrame, setFrame, timelineImperativeContext, videoId],
	);

	const toggle = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (timelineImperativeContext.imperativePlaying.current) {
				pause();
			} else {
				play(e);
			}
		},
		[pause, play, timelineImperativeContext],
	);

	const isPlaying = useCallback(() => {
		return timelineImperativeContext.imperativePlaying.current;
	}, [timelineImperativeContext]);

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
