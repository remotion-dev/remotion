import {useCallback, useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import {PlayerEmitter} from './event-emitter';

export const usePlayer = (): {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
	emitter: PlayerEmitter;
	playing: boolean;
	play: () => void;
	pause: () => void;
	seek: (newFrame: number) => void;
	getCurrentFrame: () => number;
} => {
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const audioContext = useContext(Internals.SharedAudioContext);

	const frameRef = useRef<number>();
	frameRef.current = frame;
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);

	const lastFrame = (config?.durationInFrames ?? 1) - 1;
	const isLastFrame = frame === lastFrame;

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

	const play = useCallback(() => {
		if (playing) {
			return;
		}

		if (isLastFrame) {
			seek(0);
		}

		audioContext.playAllAudios();
		setPlaying(true);
		emitter.dispatchPlay();
	}, [playing, isLastFrame, audioContext, setPlaying, emitter, seek]);

	const pause = useCallback(() => {
		if (playing) {
			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, playing, setPlaying]);

	const frameBack = useCallback(
		(frames: number) => {
			if (!video) {
				return null;
			}

			if (playing) {
				return;
			}

			if (frame === 0) {
				return;
			}

			setFrame((f) => Math.max(0, f - frames));
		},
		[frame, playing, setFrame, video]
	);

	const frameForward = useCallback(
		(frames: number) => {
			if (!video) {
				return null;
			}

			if (playing) {
				return;
			}

			if (isLastFrame) {
				return;
			}

			setFrame((f) => Math.min(lastFrame, f + frames));
		},
		[isLastFrame, lastFrame, playing, setFrame, video]
	);

	const returnValue = useMemo(() => {
		return {
			frameBack,
			frameForward,
			isLastFrame,
			emitter,
			playing,
			play,
			pause,
			seek,
			getCurrentFrame: () => frameRef.current as number,
		};
	}, [
		emitter,
		frameBack,
		frameForward,
		isLastFrame,
		pause,
		play,
		playing,
		seek,
	]);

	return returnValue;
};
