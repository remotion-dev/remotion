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

	const {
		playing,
		play,
		pause,
		pauseAndReturnToPlayStart,
		frameBack,
		seek,
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

	const onEnter = useCallback(
		(e: KeyboardEvent) => {
			if (playing) {
				pauseAndReturnToPlayStart();
			}

			e.preventDefault();
		},
		[pauseAndReturnToPlayStart, playing]
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
		const arrowLeft = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'ArrowLeft',
			callback: onArrowLeft,
			commandCtrlKey: false,
		});
		const arrowRight = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'ArrowRight',
			callback: onArrowRight,
			commandCtrlKey: false,
		});
		const space = keybindings.registerKeybinding({
			event: 'keydown',
			key: ' ',
			callback: onSpace,
			commandCtrlKey: false,
		});
		const enter = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'enter',
			callback: onEnter,
			commandCtrlKey: false,
		});
		const a = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'a',
			callback: jumpToStart,
			commandCtrlKey: false,
		});
		const e = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'e',
			callback: jumpToEnd,
			commandCtrlKey: false,
		});

		return () => {
			arrowLeft.unregister();
			arrowRight.unregister();
			space.unregister();
			enter.unregister();
			a.unregister();
			e.unregister();
		};
	}, [
		jumpToEnd,
		jumpToStart,
		keybindings,
		onArrowLeft,
		onArrowRight,
		onEnter,
		onSpace,
	]);

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
