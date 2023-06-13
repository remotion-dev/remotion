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
import {useTimelineInOutFramePosition} from '../state/in-out';
import {ControlButton} from './ControlButton';
import {
	getCurrentDuration,
	getCurrentFps,
	getCurrentFrame,
} from './Timeline/imperative-state';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';

const forwardBackStyle = {
	height: 16,
	color: 'white',
};

export const PlayPause: React.FC<{
	playbackRate: number;
	loop: boolean;
}> = ({playbackRate, loop}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();

	PlayerInternals.usePlayback({
		loop,
		playbackRate,
		moveToBeginningWhenEnded: true,
		inFrame,
		outFrame,
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
		isFirstFrame,
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
				// Don't prevent keyboard navigation
				e.preventDefault();
				pauseAndReturnToPlayStart();
			}
		},
		[pauseAndReturnToPlayStart, playing]
	);

	const onArrowLeft = useCallback(
		(e: KeyboardEvent) => {
			e.preventDefault();

			if (e.altKey) {
				seek(0);
				ensureFrameIsInViewport({
					direction: 'fit-left',
					durationInFrames: getCurrentDuration(),
					frame: 0,
				});
			} else if (e.shiftKey) {
				frameBack(getCurrentFps());
				ensureFrameIsInViewport({
					direction: 'fit-left',
					durationInFrames: getCurrentDuration(),
					frame: Math.max(0, getCurrentFrame() - getCurrentFps()),
				});
			} else {
				frameBack(1);
				ensureFrameIsInViewport({
					direction: 'fit-left',
					durationInFrames: getCurrentDuration(),
					frame: Math.max(0, getCurrentFrame() - 1),
				});
			}
		},
		[frameBack, seek]
	);

	const onArrowRight = useCallback(
		(e: KeyboardEvent) => {
			if (e.altKey) {
				seek(getCurrentDuration() - 1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration() - 1,
					frame: getCurrentDuration() - 1,
				});
			} else if (e.shiftKey) {
				frameForward(getCurrentFps());
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(
						getCurrentDuration() - 1,
						getCurrentFrame() + getCurrentFps()
					),
				});
			} else {
				frameForward(1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(getCurrentDuration() - 1, getCurrentFrame() + 1),
				});
			}

			e.preventDefault();
		},
		[frameForward, seek]
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
		seek(getCurrentDuration() - 1);
	}, [seek]);

	const keybindings = useKeybinding();

	useEffect(() => {
		const arrowLeft = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'ArrowLeft',
			callback: onArrowLeft,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		const arrowRight = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'ArrowRight',
			callback: onArrowRight,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		const space = keybindings.registerKeybinding({
			event: 'keydown',
			key: ' ',
			callback: onSpace,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		const enter = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'enter',
			callback: onEnter,
			commandCtrlKey: false,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
		});
		const a = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'a',
			callback: jumpToStart,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		const e = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'e',
			callback: jumpToEnd,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
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
				disabled={!videoConfig || isFirstFrame}
				onClick={jumpToStart}
			>
				<JumpToStart style={forwardBackStyle} />
			</ControlButton>
			<ControlButton
				aria-label="Step back one frame"
				title="Step back one frame"
				disabled={!videoConfig || isFirstFrame}
				onClick={oneFrameBack}
			>
				<StepBack style={forwardBackStyle} />
			</ControlButton>

			<ControlButton
				aria-label={playing ? 'Pause' : 'Play'}
				title={playing ? 'Pause' : 'Play'}
				onClick={playing ? pause : play}
				disabled={!videoConfig}
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
				disabled={!videoConfig || isLastFrame}
				onClick={oneFrameForward}
			>
				<StepForward style={forwardBackStyle} />
			</ControlButton>
		</>
	);
};
