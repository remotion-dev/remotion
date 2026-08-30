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
	const {setPlaying} = useContext(Internals.SetTimelineContext);
	const timelineContext = useContext(Internals.TimelineContext);
	const audioContext = useContext(Internals.SharedAudioContext);
	const audioTagsContext = useContext(Internals.SharedAudioTagsContext);
	const environment = useRemotionEnvironment();
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);
	const playStart = useRef(0);
	const fallbackFrame = useRef<number | null>(null);

	if (!timelineContext) {
		throw new Error(
			'Timeline context is not available. This hook must be used inside a <Player> or the Remotion Studio.',
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
			timelineContext.frame[video.id] ??
			(environment.isPlayer
				? 0
				: Internals.Timeline.getFrameForComposition(video.id));

		return Internals.Timeline.clampFrameToCompositionRange(
			unclamped,
			video.durationInFrames,
		);
	}, [environment.isPlayer, timelineContext, video]);

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
				if (timelineContext.frame[video.id] !== frameToSeekTo) {
					timelineContext.frame = {
						...timelineContext.frame,
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
		[config, emitter, setTimelinePosition, timelineContext, video?.id],
	);

	const play = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (timelineContext.playbackStore.store.getSnapshot().playing) {
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
			timelineContext.audioAndVideoTags.current.forEach((tag) =>
				tag.play('player play() was called and playing audio from a click'),
			);

			timelineContext.playbackStore.setSnapshot({playing: true});
			playStart.current = getCurrentFrame();
		},
		[
			audioContext,
			audioTagsContext,
			config?.durationInFrames,
			getCurrentFrame,
			seek,
			setPlaying,
			timelineContext,
		],
	);

	const pause = useCallback(() => {
		if (timelineContext.playbackStore.store.getSnapshot().playing) {
			timelineContext.playbackStore.setSnapshot({playing: false});

			audioContext?.suspend();
		}
	}, [audioContext, timelineContext]);

	const pauseAndReturnToPlayStart = useCallback(() => {
		if (timelineContext.playbackStore.store.getSnapshot().playing) {
			timelineContext.playbackStore.setSnapshot({playing: false});
			fallbackFrame.current = playStart.current;
			if (config) {
				timelineContext.frame = {
					...timelineContext.frame,
					[config.id]: playStart.current,
				};
				setTimelinePosition((currentFrames) => ({
					...currentFrames,
					[config.id]: playStart.current,
				}));
			}
		}
	}, [config, setTimelinePosition, timelineContext]);

	const videoId = video?.id;
	const lastFrame = (config?.durationInFrames ?? 1) - 1;

	const frameBack = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (timelineContext.playbackStore.store.getSnapshot().playing) {
				return;
			}

			const previousFrame =
				timelineContext.frame[videoId] ?? window.remotion_initialFrame ?? 0;
			const newFrame = Math.max(0, previousFrame - frames);
			if (previousFrame === newFrame) {
				return;
			}

			timelineContext.frame = {
				...timelineContext.frame,
				[videoId]: newFrame,
			};
			setFrame((currentFrames) =>
				currentFrames[videoId] === newFrame
					? currentFrames
					: {...currentFrames, [videoId]: newFrame},
			);
		},
		[setFrame, timelineContext, videoId],
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (timelineContext.playbackStore.store.getSnapshot().playing) {
				return;
			}

			const previousFrame =
				timelineContext.frame[videoId] ?? window.remotion_initialFrame ?? 0;
			const newFrame = Math.min(lastFrame, previousFrame + frames);
			if (previousFrame === newFrame) {
				return;
			}

			timelineContext.frame = {
				...timelineContext.frame,
				[videoId]: newFrame,
			};
			setFrame((currentFrames) =>
				currentFrames[videoId] === newFrame
					? currentFrames
					: {...currentFrames, [videoId]: newFrame},
			);
		},
		[lastFrame, setFrame, timelineContext, videoId],
	);

	const toggle = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (timelineContext.playbackStore.store.getSnapshot().playing) {
				pause();
			} else {
				play(e);
			}
		},
		[pause, play, timelineContext],
	);

	const isPlaying = useCallback(() => {
		return timelineContext.playbackStore.store.getSnapshot().playing as boolean;
	}, [timelineContext]);

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
