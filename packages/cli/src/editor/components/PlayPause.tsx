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

const forwardBackStyle = {
	height: 16,
	width: 16,
	color: 'white',
};

export const PlayPause: React.FC<{
	playbackRate: number;
	loop: boolean;
}> = ({playbackRate, loop}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const video = Internals.useVideo();
	PlayerInternals.usePlayback({
		loop,
		playbackRate,
	});

	const {playing, play, pause, frameBack, frameForward, isLastFrame} =
		PlayerInternals.usePlayer();

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
	const videoFps = video?.fps ?? null;

	const onArrowLeft = useCallback(
		(e: KeyboardEvent) => {
			if (!videoFps) {
				return null;
			}

			frameBack(e.shiftKey ? videoFps : 1);
			e.preventDefault();
		},
		[frameBack, videoFps]
	);

	const onArrowRight = useCallback(
		(e: KeyboardEvent) => {
			if (!videoFps) {
				return null;
			}

			frameForward(e.shiftKey ? videoFps : 1);
			e.preventDefault();
		},
		[frameForward, videoFps]
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
		const space = keybindings.registerKeybinding('keydown', ' ', onSpace);

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
				title="Step back one frame"
				disabled={frame === 0}
				onClick={oneFrameBack}
			>
				<StepBack style={forwardBackStyle} />
			</ControlButton>

			<ControlButton
				aria-label={playing ? 'Pause' : 'Play'}
				title={playing ? 'Pause' : 'Play'}
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
				title="Step forward one frame"
				disabled={isLastFrame}
				onClick={oneFrameForward}
			>
				<StepForward style={forwardBackStyle} />
			</ControlButton>
		</>
	);
};
