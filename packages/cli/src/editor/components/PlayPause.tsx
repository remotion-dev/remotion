import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {getLastFrames, setLastFrames} from '../state/last-frames';
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
			if (p) {
				setLastFrames([]);
			}
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

	const isLastFrame = frame === (config?.durationInFrames ?? 1);

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

	const [isUsingRAF, toggleRAF] = useState(false);

	useEffect(() => {
		if (isUsingRAF) return;

		if (!config) {
			return;
		}

		if (playing) {
			setLastFrames([...getLastFrames(), Date.now()]);
			const last15Frames = getLastFrames();
			const timesBetweenFrames: number[] = last15Frames
				.map((f, i) => {
					if (i === 0) {
						return null;
					}
					return f - last15Frames[i - 1];
				})
				.filter((_t) => _t !== null) as number[];
			const averageTimeBetweenFrames =
				timesBetweenFrames.reduce((a, b) => {
					return a + b;
				}, 0) / timesBetweenFrames.length;
			const expectedTime = 1000 / config.fps;
			const slowerThanExpected = averageTimeBetweenFrames - expectedTime;
			const timeout =
				last15Frames.length === 0
					? expectedTime
					: expectedTime - slowerThanExpected;
			const duration = config.durationInFrames;
			const t = setTimeout(() => {
				setFrame((currFrame) => {
					const nextFrame = currFrame + 1;
					if (nextFrame >= duration) {
						return 0;
					}
					return nextFrame;
				});
			}, timeout * 5);
			return () => {
				clearTimeout(t);
			};
		}
	}, [isUsingRAF, config, frame, playing, setFrame, video]);

	const frameRef = useRef(frame);
	frameRef.current = frame;
	useEffect(() => {
		if (!isUsingRAF) return;

		if (!config) {
			return;
		}

		if (playing) {
			let req: number | null = null;
			const startedTime = performance.now();
			const startedFrame = frameRef.current;

			const step = () => {
				setLastFrames([...getLastFrames(), Date.now()]);
				const time = performance.now() - startedTime;
				const calcuratedFrame =
					(Math.round(time / (1000 / config.fps)) + startedFrame) %
					config.durationInFrames;
				if (calcuratedFrame !== frameRef.current) setFrame(calcuratedFrame);
				req = requestAnimationFrame(step);
			};

			req = requestAnimationFrame(step);

			return () => {
				if (req !== null) {
					cancelAnimationFrame(req);
				}
			};
		}
	}, [isUsingRAF, config, setFrame, playing]);

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
			<div style={{width: 10}} />
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
			<div style={{width: 10}} />
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
			<div style={{width: 10}} />
			<ControlButton
				aria-label="Step forward one frame"
				disabled={isLastFrame}
				onClick={() => toggleRAF((s) => !s)}
			>
				<span
					style={{
						height: 16,
						color: 'white',
					}}
				>
					{isUsingRAF ? 'requestAnimationFrame' : 'setTimeout'}
				</span>
			</ControlButton>
		</>
	);
};
