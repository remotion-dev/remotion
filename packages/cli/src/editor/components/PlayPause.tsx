import {usePlaybackTime} from '@remotion/player';
import React, {useEffect} from 'react';
import {Internals} from 'remotion';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {ControlButton} from './ControlButton';

export const PlayPause: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();
	const video = Internals.useVideo();

	const [
		toggle,
		frameBack,
		frameForward,
		onKeyPress,
		isLastFrame,
	] = usePlaybackTime();

	useEffect(() => {
		window.addEventListener('keydown', onKeyPress);
		return (): void => {
			window.removeEventListener('keydown', onKeyPress);
		};
	}, [onKeyPress]);

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
