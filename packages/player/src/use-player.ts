import type {SyntheticEvent} from 'react';
import {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context.js';
import type {PlayerEmitter} from './event-emitter.js';

type UsePlayerMethods = {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
	isFirstFrame: boolean;
	emitter: PlayerEmitter;
	playing: boolean;
	play: (e?: SyntheticEvent | PointerEvent) => void;
	pause: () => void;
	pauseAndReturnToPlayStart: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
	isPlaying: () => boolean;
	hasPlayed: boolean;
	isBuffering: () => boolean;
	toggle: (e?: SyntheticEvent | PointerEvent) => void;
};

export const usePlayer = (): UsePlayerMethods => {
	const [playing, setPlaying, imperativePlaying] =
		Internals.Timeline.usePlayingState();
	const [hasPlayed, setHasPlayed] = useState(false);
	const frame = Internals.Timeline.useTimelinePosition();
	const playStart = useRef(frame);
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const audioContext = useContext(Internals.SharedAudioContext);
	const {audioAndVideoTags} = useContext(Internals.TimelineContext);

	const frameRef = useRef<number>(frame);
	frameRef.current = frame;

	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);

	const lastFrame = (config?.durationInFrames ?? 1) - 1;
	const isLastFrame = frame === lastFrame;
	const isFirstFrame = frame === 0;

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
	}

	const bufferingContext = useContext(Internals.BufferingContextReact);
	if (!bufferingContext) {
		throw new Error(
			'Missing the buffering context. Most likely you have a Remotion version mismatch.',
		);
	}

	const {buffering} = bufferingContext;

	const seek = useCallback(
		(newFrame: number) => {
			if (video?.id) {
				setTimelinePosition((c) => ({...c, [video.id]: newFrame}));
			}

			frameRef.current = newFrame;

			emitter.dispatchSeek(newFrame);
		},
		[emitter, setTimelinePosition, video?.id],
	);

	const play = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (imperativePlaying.current) {
				return;
			}

			setHasPlayed(true);

			if (isLastFrame) {
				seek(0);
			}

			audioContext?.audioContext?.resume();

			/**
			 * Play silent audio tags to warm them up for autoplay
			 */
			if (audioContext && audioContext.numberOfAudioTags > 0 && e) {
				audioContext.playAllAudios();
			}

			/**
			 * Play audios and videos directly here so they can benefit from
			 * being triggered by a click
			 */
			audioAndVideoTags.current.forEach((a) =>
				a.play('player play() was called and playing audio from a click'),
			);

			imperativePlaying.current = true;
			setPlaying(true);
			playStart.current = frameRef.current as number;
			emitter.dispatchPlay();
		},
		[
			imperativePlaying,
			isLastFrame,
			audioContext,
			setPlaying,
			emitter,
			seek,
			audioAndVideoTags,
		],
	);

	const pause = useCallback(() => {
		if (imperativePlaying.current) {
			imperativePlaying.current = false;

			setPlaying(false);
			emitter.dispatchPause();
			audioContext?.audioContext?.suspend();
		}
	}, [emitter, imperativePlaying, setPlaying, audioContext]);

	const pauseAndReturnToPlayStart = useCallback(() => {
		if (imperativePlaying.current) {
			imperativePlaying.current = false;
			frameRef.current = playStart.current as number;
			if (config) {
				setTimelinePosition((c) => ({
					...c,
					[config.id]: playStart.current as number,
				}));
				setPlaying(false);
				emitter.dispatchPause();
			}
		}
	}, [config, emitter, imperativePlaying, setPlaying, setTimelinePosition]);

	const videoId = video?.id;

	const frameBack = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((c) => {
				const prevFrame = c[videoId] ?? window.remotion_initialFrame ?? 0;
				const newFrame = Math.max(0, prevFrame - frames);
				if (prevFrame === newFrame) {
					return c;
				}

				return {
					...c,
					[videoId]: newFrame,
				};
			});
		},
		[imperativePlaying, setFrame, videoId],
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!videoId) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((c) => {
				const prevFrame = c[videoId] ?? window.remotion_initialFrame ?? 0;
				const newFrame = Math.min(lastFrame, prevFrame + frames);
				if (prevFrame === newFrame) {
					return c;
				}

				return {
					...c,
					[videoId]: newFrame,
				};
			});
		},
		[videoId, imperativePlaying, lastFrame, setFrame],
	);

	const toggle = useCallback(
		(e?: SyntheticEvent | PointerEvent) => {
			if (imperativePlaying.current) {
				pause();
			} else {
				play(e);
			}
		},
		[imperativePlaying, pause, play],
	);

	const returnValue: UsePlayerMethods = useMemo(() => {
		return {
			frameBack,
			frameForward,
			isLastFrame,
			emitter,
			playing,
			play,
			pause,
			seek,
			isFirstFrame,
			getCurrentFrame: () => frameRef.current,
			isPlaying: () => imperativePlaying.current,
			isBuffering: () => buffering.current,
			pauseAndReturnToPlayStart,
			hasPlayed,
			toggle,
		};
	}, [
		buffering,
		emitter,
		frameBack,
		frameForward,
		hasPlayed,
		imperativePlaying,
		isFirstFrame,
		isLastFrame,
		pause,
		pauseAndReturnToPlayStart,
		play,
		playing,
		seek,
		toggle,
	]);

	return returnValue;
};
