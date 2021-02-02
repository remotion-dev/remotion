import React, {useCallback, useEffect} from 'react';
import {
	usePlayingState,
	useTimelinePosition,
	useTimelineSetFrame,
	useUnsafeVideoConfig,
	useVideo,
} from 'remotion';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {getLastFrames, setLastFrames} from '../state/last-frames';

export const PlayPause: React.FC = () => {
	const [playing, setPlaying] = usePlayingState();
	const frame = useTimelinePosition();
	const setFrame = useTimelineSetFrame();
	const video = useVideo();
	const config = useUnsafeVideoConfig();

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

	useEffect(() => {
		if (!config) {
			return;
		}

		if (playing) {
			setLastFrames([...getLastFrames(), Date.now()]);
			const last10Frames = getLastFrames();
			const timesBetweenFrames: number[] = last10Frames
				.map((f, i) => {
					if (i === 0) {
						return null;
					}
					return f - last10Frames[i - 1];
				})
				.filter((_t) => _t !== null) as number[];
			const averageTimeBetweenFrames =
				timesBetweenFrames.reduce((a, b) => {
					return a + b;
				}, 0) / timesBetweenFrames.length;
			const expectedTime = 1000 / config.fps;
			const slowerThanExpected = averageTimeBetweenFrames - expectedTime;
			const timeout =
				last10Frames.length === 0
					? expectedTime
					: expectedTime - slowerThanExpected;
			const duration = config.durationInFrames;
			const t = setTimeout(() => {
				setFrame((currFrame) => {
					const nextFrame = currFrame + 1;
					if (nextFrame >= duration) {
						return 0;
					}
					return currFrame + 1;
				});
			}, timeout);
			return () => {
				clearTimeout(t);
			};
		}
	}, [config, frame, playing, setFrame, video]);

	return (
		<>
			<div
				onClick={frameBack}
				style={{
					display: 'inline-flex',
					opacity: frame === 0 ? 0.5 : 1,
					userSelect: 'none',
				}}
			>
				<StepBack
					style={{
						height: 16,
						width: 16,
						color: 'white',
					}}
				/>
			</div>
			<div style={{width: 10}} />
			<div
				onClick={toggle}
				title={playing ? 'Pause' : 'Play'}
				style={{
					display: 'inline-flex',
					opacity: video ? 1 : 0.5,
					userSelect: 'none',
				}}
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
			</div>
			<div style={{width: 10}} />
			<div
				onClick={frameForward}
				style={{
					display: 'inline-flex',
					opacity: isLastFrame ? 0.5 : 1,
					userSelect: 'none',
				}}
			>
				<StepForward
					style={{
						height: 16,
						width: 16,
						color: 'white',
					}}
				/>
			</div>
		</>
	);
};
