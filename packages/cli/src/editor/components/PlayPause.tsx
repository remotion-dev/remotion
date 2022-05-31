import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {JumpToStart} from '../icons/jump-to-start';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {ControlButton} from './ControlButton';

const forwardBackStyle = {
	height: 16,
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

	const {playing, play, pause, frameBack, seek, frameForward, isLastFrame} =
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

			e.preventDefault();

			if (e.altKey) {
				seek(0);
			} else if (e.shiftKey) {
				frameBack(videoFps);
			} else {
				frameBack(1);
			}
		},
		[frameBack, seek, videoFps]
	);

	const onArrowRight = useCallback(
		(e: KeyboardEvent) => {
			if (!video) {
				return null;
			}

			if (e.altKey) {
				seek(video.durationInFrames - 1);
			} else if (e.shiftKey) {
				frameForward(video.fps);
			} else {
				frameForward(1);
			}

			e.preventDefault();
		},
		[frameForward, seek, video]
	);

	const oneFrameBack = useCallback(() => {
		frameBack(1);
	}, [frameBack]);

	const oneFrameForward = useCallback(() => {
		frameForward(1);
	}, [frameForward]);

	const jumpToStart = useCallback(() => {
		seek(0);
	}, [seek]);

	const jumpToEnd = useCallback(() => {
		if (!video) {
			return;
		}

		seek(video.durationInFrames - 1);
	}, [seek, video]);

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
		const a = keybindings.registerKeybinding('keydown', 'a', jumpToStart);
		const e = keybindings.registerKeybinding('keydown', 'e', jumpToEnd);

		return () => {
			arrowLeft.unregister();
			arrowRight.unregister();
			space.unregister();
			a.unregister();
			e.unregister();
		};
	}, [jumpToEnd, jumpToStart, keybindings, onArrowLeft, onArrowRight, onSpace]);

	if (isStill) {
		return null;
	}

	return (
		<>
			<ControlButton
				aria-label="Jump to beginning"
				title="Jump to beginning"
				disabled={frame === 0}
				onClick={jumpToStart}
			>
				<JumpToStart style={forwardBackStyle} />
			</ControlButton>
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
