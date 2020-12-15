import React, {useCallback, useEffect} from 'react';
import {
	usePlayingState,
	useTimelinePosition,
	useVideo,
	useVideoConfig,
} from 'remotion';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {getLastFrames, setLastFrames} from '../state/last-frames';

export const PlayPause: React.FC = () => {
	const [playing, setPlaying] = usePlayingState();
	const [frame, setFrame] = useTimelinePosition();
	const video = useVideo();
	const config = useVideoConfig();

	const toggle = useCallback(() => {
		if (!video) {
			return null;
		}
		setPlaying((p) => !p);
	}, [video, setPlaying]);

	const onKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (e.code === 'Space') {
				toggle();
				e.preventDefault();
			}
		},
		[toggle]
	);

	useEffect(() => {
		window.addEventListener('keypress', onKeyPress);
		return (): void => {
			window.removeEventListener('keypress', onKeyPress);
		};
	}, [onKeyPress]);

	useEffect(() => {
		if (!video) {
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
			const t = setTimeout(() => {
				setFrame((currFrame) => {
					const nextFrame = currFrame + 1;
					// TODO: Could be timing unsafe
					if (nextFrame >= config.durationInFrames) {
						return 0;
					}
					return currFrame + 1;
				});
			}, timeout);
			return () => {
				clearTimeout(t);
			};
		}
	}, [config, frame, playing, setFrame]);

	return (
		<div
			onClick={toggle}
			style={{display: 'inline-flex', opacity: video ? 1 : 0.5}}
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
	);
};
