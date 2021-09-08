import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
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

	const isStill = useIsStill();

	useEffect(() => {
		if (isStill) {
			pause();
		}
	}, [isStill, pause]);

	const onSpace = useCallback(
		(e: KeyboardEvent) => {
			if (playing) {
				pause();
			} else {
				play();
			}

			e.preventDefault();
		},
		[pause, play, playing]
	);

	const onArrowLeft = useCallback(
		(e: KeyboardEvent) => {
			if (!video) {
				return null;
			}

			frameBack(e.shiftKey ? video.fps : 1);
			e.preventDefault();
		},
		[frameBack, video]
	);

	const onArrowRight = useCallback(
		(e: KeyboardEvent) => {
			if (!video) {
				return null;
			}

			frameForward(e.shiftKey ? video.fps : 1);
			e.preventDefault();
		},
		[frameForward, video]
	);

	const oneFrameBack = useCallback(() => {
		frameBack(1);
	}, [frameBack]);

	const oneFrameForward = useCallback(() => {
		frameForward(1);
	}, [frameForward]);
	const keybindings = useKeybinding();

	useEffect(() => {
		const arrowLeft = keybindings.registerKeybinding(
			'keydown',
			'ArrowLeft',
			onArrowLeft
		);
		const arrowRight = keybindings.registerKeybinding(
			'keydown',
			'ArrowRight',
			onArrowRight
		);
		const space = keybindings.registerKeybinding('keydown', 'Space', onSpace);

		return () => {
			arrowLeft.unregister();
			arrowRight.unregister();
			space.unregister();
		};
	}, [keybindings, onArrowLeft, onArrowRight, onSpace]);

	if (isStill) {
		return null;
	}

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
