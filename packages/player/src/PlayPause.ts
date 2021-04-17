import {useCallback, useEffect, useRef} from 'react';
import {Internals} from 'remotion';

export const usePlaybackTime = (): {
	toggle: () => void;
	frameBack: (frames: number) => void;
	frameForward: (frames: number) => void;
	isLastFrame: boolean;
} => {
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.Timeline.useTimelineSetFrame();
	const video = Internals.useVideo();
	const config = Internals.useUnsafeVideoConfig();

	const toggle = useCallback(() => {
		if (!video) {
			return null;
		}
		setPlaying((p) => {
			return !p;
		});
	}, [video, setPlaying]);

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

	const frameRef = useRef(frame);
	frameRef.current = frame;

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

	return {toggle, frameBack, frameForward, isLastFrame};
};
