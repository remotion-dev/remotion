import React, {useCallback, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {ControlButton} from './ControlButton';

export const PlayPause: React.FC = () => {
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

	const frameBack = useCallback(() => {
		if (!video) {
			return null;
		}

		if (playing) {
			return;
		}

		if (frame === 0) {
			return;
		}

		setFrame((f) => f - 1);
	}, [frame, playing, setFrame, video]);

	const isLastFrame = frame === (config?.durationInFrames ?? 1) - 1;

	const frameForward = useCallback(() => {
		if (!video) {
			return null;
		}

		if (playing) {
			return;
		}

		if (isLastFrame) {
			return;
		}

		setFrame((f) => f + 1);
	}, [isLastFrame, playing, setFrame, video]);

	const onKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (e.code === 'Space') {
				toggle();
				e.preventDefault();
			}

			if (e.code === 'ArrowLeft') {
				frameBack();
				e.preventDefault();
			}

			if (e.code === 'ArrowRight') {
				frameForward();
				e.preventDefault();
			}
		},
		[frameBack, frameForward, toggle]
	);

	useEffect(() => {
		window.addEventListener('keydown', onKeyPress);
		return (): void => {
			window.removeEventListener('keydown', onKeyPress);
		};
	}, [onKeyPress]);

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

	return (
		<>
			<ControlButton
				aria-label="Step back one frame"
				disabled={frame === 0}
				onClick={frameBack}
			>
				<StepBack
					style={{
						height: 16,
						width: 16,
						color: 'white',
					}}
				/>
			</ControlButton>

			<ControlButton
				aria-label={playing ? 'Pause' : 'Play'}
				disabled={!video}
				onClick={toggle}
			>
				{playing ? (
					<Pause
						style={{
							height: 14,
							width: 14,
							color: 'white',
						}}
					/>
				) : (
					<Play
						style={{
							height: 14,
							width: 14,
							color: 'white',
						}}
					/>
				)}
			</ControlButton>

			<ControlButton
				aria-label="Step forward one frame"
				disabled={isLastFrame}
				onClick={frameForward}
			>
				<StepForward
					style={{
						height: 16,
						width: 16,
						color: 'white',
					}}
				/>
			</ControlButton>
		</>
	);
};
