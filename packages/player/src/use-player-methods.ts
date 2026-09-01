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
	playAsAutoPlay: () => void;
	pause: () => void;
	pauseAndReturnToPlayStart: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
	isPlaying: () => boolean;
	isBuffering: () => boolean;
	toggle: (e?: SyntheticEvent | PointerEvent) => void;
};

export const usePlayerMethods = (): UsePlayerMethods => {
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const {
		setPlaying,
		setLastSeek,
		frameRef,
		audioAndVideoTags,
		isPlaying: readIsPlaying,
		isBuffering,
	} = useContext(Internals.SetTimelineContext);
	const audioContext = useContext(Internals.SharedAudioContext);
	const audioTagsContext = useContext(Internals.SharedAudioTagsContext);
	const environment = useRemotionEnvironment();
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);
	const playStart = useRef(0);
	const fallbackFrame = useRef<number | null>(null);
	const nextPlayIsAutoPlayAttempt = useRef(false);

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
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

	const setFrameFromSeek = useCallback(
		(newFrame: number, compositionId: string | undefined) => {
			fallbackFrame.current = newFrame;
			setLastSeek(newFrame);

			if (!compositionId) {
				return;
			}

			if (frameRef.current[compositionId] !== newFrame) {
				frameRef.current = {...frameRef.current, [compositionId]: newFrame};
			}

			setTimelinePosition((currentFrames) =>
				currentFrames[compositionId] === newFrame
					? currentFrames
					: {...currentFrames, [compositionId]: newFrame},
			);
		},
		[frameRef, setLastSeek, setTimelinePosition],
	);

	const seek = useCallback(
		(newFrame: number) => {
			const frameToSeekTo = config
				? Internals.TimelinePosition.clampFrameToCompositionRange(
						newFrame,
						config.durationInFrames,
					)
				: Math.max(0, newFrame);

			setFrameFromSeek(frameToSeekTo, video?.id);

			emitter.dispatchSeek(frameToSeekTo);
		},
		[config, emitter, setFrameFromSeek, video?.id],
	);

	const play = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			const isAutoPlayAttempt = nextPlayIsAutoPlayAttempt.current;
			nextPlayIsAutoPlayAttempt.current = false;
			if (readIsPlaying()) {
				return;
			}

			const lastFrameForPlayback = (config?.durationInFrames ?? 1) - 1;
			if (getCurrentFrame() === lastFrameForPlayback) {
				seek(0);
			}

			if (isAutoPlayAttempt) {
				audioContext?.resumeAsAutoPlay();
			} else {
				audioContext?.resume();
			}

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
			audioAndVideoTags.current.forEach((tag) =>
				tag.play('player play() was called and playing audio from a click'),
			);

			setPlaying(true);
			playStart.current = getCurrentFrame();
			emitter.dispatchPlay();
		},
		[
			audioAndVideoTags,
			audioContext,
			audioTagsContext,
			config?.durationInFrames,
			emitter,
			getCurrentFrame,
			readIsPlaying,
			seek,
			setPlaying,
		],
	);
	const playAsAutoPlay = useCallback(() => {
		nextPlayIsAutoPlayAttempt.current = true;
		play();
	}, [play]);

	const pause = useCallback(() => {
		if (readIsPlaying()) {
			setPlaying(false);

			emitter.dispatchPause();
			audioContext?.suspend();
		}
	}, [audioContext, emitter, readIsPlaying, setPlaying]);

	const pauseAndReturnToPlayStart = useCallback(() => {
		if (readIsPlaying()) {
			setPlaying(false);
			setFrameFromSeek(playStart.current, config?.id);
			if (config) {
				emitter.dispatchPause();
			}
		}
	}, [config, emitter, readIsPlaying, setFrameFromSeek, setPlaying]);

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

			setFrameFromSeek(newFrame, videoId);
		},
		[frameRef, readIsPlaying, setFrameFromSeek, videoId],
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

			setFrameFromSeek(newFrame, videoId);
		},
		[frameRef, lastFrame, readIsPlaying, setFrameFromSeek, videoId],
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

	return useMemo(() => {
		return {
			frameBack,
			frameForward,
			emitter,
			play,
			playAsAutoPlay,
			pause,
			seek,
			getCurrentFrame,
			isPlaying: readIsPlaying,
			isBuffering,
			pauseAndReturnToPlayStart,
			toggle,
		};
	}, [
		emitter,
		frameBack,
		frameForward,
		getCurrentFrame,
		readIsPlaying,
		pause,
		pauseAndReturnToPlayStart,
		play,
		playAsAutoPlay,
		isBuffering,
		seek,
		toggle,
	]);
};
