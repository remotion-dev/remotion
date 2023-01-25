import type {SyntheticEvent} from 'react';
import {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import type {PlayerEmitter} from './event-emitter';

type UsePlayerMethods = {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
	isFirstFrame: boolean;
	emitter: PlayerEmitter;
	playing: boolean;
	play: (e?: SyntheticEvent) => void;
	pause: () => void;
	pauseAndReturnToPlayStart: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
	isPlaying: () => boolean;
	hasPlayed: boolean;
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
	const {audioAndVideoTags} = useContext(Internals.Timeline.TimelineContext);

	const frameRef = useRef<number>();
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

	const seek = useCallback(
		(newFrame: number) => {
			setTimelinePosition(newFrame);
			emitter.dispatchSeek(newFrame);
		},
		[emitter, setTimelinePosition]
	);

	const play = useCallback(
		(e?: SyntheticEvent) => {
			if (imperativePlaying.current) {
				return;
			}

			setHasPlayed(true);

			if (isLastFrame) {
				seek(0);
			}

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
			audioAndVideoTags.current.forEach((a) => a.play());

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
		]
	);

	const pause = useCallback(() => {
		if (imperativePlaying.current) {
			imperativePlaying.current = false;

			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, imperativePlaying, setPlaying]);

	const pauseAndReturnToPlayStart = useCallback(() => {
		if (imperativePlaying.current) {
			imperativePlaying.current = false;

			setTimelinePosition(playStart.current as number);
			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, imperativePlaying, setPlaying, setTimelinePosition]);

	const hasVideo = Boolean(video);

	const frameBack = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((f) => {
				return Math.max(0, f - frames);
			});
		},
		[hasVideo, imperativePlaying, setFrame]
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!hasVideo) {
				return null;
			}

			if (imperativePlaying.current) {
				return;
			}

			setFrame((f) => Math.min(lastFrame, f + frames));
		},
		[hasVideo, imperativePlaying, lastFrame, setFrame]
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
			getCurrentFrame: () => frameRef.current as number,
			isPlaying: () => imperativePlaying.current as boolean,
			pauseAndReturnToPlayStart,
			hasPlayed,
		};
	}, [
		frameBack,
		frameForward,
		isLastFrame,
		emitter,
		playing,
		play,
		pause,
		seek,
		isFirstFrame,
		pauseAndReturnToPlayStart,
		imperativePlaying,
		hasPlayed,
	]);

	return returnValue;
};
