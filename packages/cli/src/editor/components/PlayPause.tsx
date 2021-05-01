import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {Internals} from 'remotion';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {ControlButton} from './ControlButton';

export const PlayPause: React.FC = () => {
	const frame = Internals.Timeline.useTimelinePosition();
	const video = Internals.useVideo();
	PlayerInternals.usePlayback({loop: true});

	const {
		playing,
		play,
		pause,
		frameBack,
		frameForward,
		isLastFrame,
	} = PlayerInternals.usePlayer();

	const onKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (!video) {
				return;
			}
			if (e.code === 'Space') {
				if (playing) {
					pause();
				} else {
					play();
				}
				e.preventDefault();
			}

			if (e.code === 'ArrowLeft') {
				frameBack(e.shiftKey ? video.fps : 1);
				e.preventDefault();
			}

			if (e.code === 'ArrowRight') {
				frameForward(e.shiftKey ? video.fps : 1);
				e.preventDefault();
			}
		},
		[frameBack, frameForward, pause, play, playing, video]
	);

	const oneFrameBack = useCallback(() => {
		frameBack(1);
	}, [frameBack]);

	const oneFrameForward = useCallback(() => {
		frameForward(1);
	}, [frameForward]);

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
				onClick={oneFrameBack}
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
				onClick={playing ? pause : play}
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
				onClick={oneFrameForward}
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
