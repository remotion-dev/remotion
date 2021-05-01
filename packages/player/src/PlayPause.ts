import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {PlayerEventEmitterContext} from './emitter-context';
import {PlayerEmitter} from './event-emitter';

export const usePlayback = (): {
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
	emitter: PlayerEmitter;
	playing: boolean;
	play: () => void;
	pause: () => void;
	seek: (newFrame: number) => void;
} => {
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();

	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();
	const emitter = useContext(PlayerEventEmitterContext);

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
	}

	const frameRef = useRef(frame);
	frameRef.current = frame;

	const play = useCallback(() => {
		if (!playing) {
			setPlaying(true);
			emitter.dispatchPlay();
		}
	}, [emitter, setPlaying, playing]);

	const pause = useCallback(() => {
		if (playing) {
			setPlaying(false);
			emitter.dispatchPause();
		}
	}, [emitter, playing, setPlaying]);

	const seek = useCallback(
		(newFrame: number) => {
			setTimelinePosition(newFrame);
			emitter.dispatchSeek(newFrame);
		},
		[emitter, setTimelinePosition]
	);

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

	const lastFrame = (config?.durationInFrames ?? 1) - 1;
	const isLastFrame = frame === lastFrame;

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

	useEffect(() => {
		if (!config) {
			return;
		}

		if (!playing) {
			return;
		}

		let hasBeenStopped = false;
		let reqAnimFrameCall: number | null = null;
		const startedTime = performance.now();
		const startedFrame = frameRef.current;

		const callback = () => {
			const time = performance.now() - startedTime;
			const calculatedFrame =
				(Math.round(time / (1000 / config.fps)) + startedFrame) %
				config.durationInFrames;
			if (calculatedFrame !== frameRef.current) {
				setFrame(calculatedFrame);
			}

			if (!hasBeenStopped) {
				reqAnimFrameCall = requestAnimationFrame(callback);
			}
		};

		reqAnimFrameCall = requestAnimationFrame(callback);

		return () => {
			hasBeenStopped = true;
			if (reqAnimFrameCall !== null) {
				cancelAnimationFrame(reqAnimFrameCall);
			}
		};
	}, [config, setFrame, playing]);

	return {
		frameBack,
		frameForward,
		isLastFrame,
		emitter,
		playing,
		play,
		pause,
		seek,
	};
};
