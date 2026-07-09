import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {WHITE} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {JumpToStart} from '../icons/jump-to-start';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {useTimelineInOutFramePosition} from '../state/in-out';
import {ControlButton} from './ControlButton';
import {getCurrentDuration} from './Timeline/imperative-state';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';

const backStyle = {
	height: 18,
	color: WHITE,
};

const forwardBackStyle = {
	height: 16,
	color: WHITE,
};

const iconButton: React.CSSProperties = {
	height: 14,
	width: 14,
	color: WHITE,
};

export const PlayPause: React.FC<{
	readonly playbackRate: number;
	readonly loop: boolean;
	readonly bufferStateDelayInMilliseconds: number;
	readonly muted: boolean;
}> = ({playbackRate, loop, bufferStateDelayInMilliseconds, muted}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [showBufferIndicator, setShowBufferState] = useState<boolean>(false);

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
		emitter,
		getCurrentFrame,
	} = PlayerInternals.usePlayer();

	PlayerInternals.usePlayback({
		loop,
		playbackRate,
		moveToBeginningWhenEnded: true,
		inFrame,
		outFrame,
		getCurrentFrame,
		browserMediaControlsBehavior: {
			mode: 'register-media-session',
		},
		muted,
	});

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
		[pause, play, playing],
	);

	const onEnter = useCallback(
		(e: KeyboardEvent) => {
			if (playing) {
				// Don't prevent keyboard navigation
				e.preventDefault();
				pauseAndReturnToPlayStart();
			}
		},
		[pauseAndReturnToPlayStart, playing],
	);

	const oneFrameBack = useCallback(() => {
		frameBack(1);
		ensureFrameIsInViewport({
			direction: 'fit-left',
			durationInFrames: getCurrentDuration(),
			frame: Math.max(0, getCurrentFrame() - 1),
		});
	}, [frameBack, getCurrentFrame]);

	const oneFrameForward = useCallback(() => {
		frameForward(1);
		ensureFrameIsInViewport({
			direction: 'fit-right',
			durationInFrames: getCurrentDuration(),
			frame: Math.min(getCurrentDuration() - 1, getCurrentFrame() + 1),
		});
	}, [frameForward, getCurrentFrame]);

	const jumpToStart = useCallback(() => {
		seek(inFrame ?? 0);
	}, [seek, inFrame]);

	const jumpToEnd = useCallback(() => {
		seek(outFrame ?? getCurrentDuration() - 1);
	}, [seek, outFrame]);

	const keybindings = useKeybinding();

	useEffect(() => {
		const commandArrowLeft = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'ArrowLeft',
			callback: oneFrameBack,
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const commandArrowRight = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'ArrowRight',
			callback: oneFrameForward,
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const space = keybindings.registerKeybinding({
			event: 'keydown',
			key: ' ',
			callback: onSpace,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const enter = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'enter',
			callback: onEnter,
			commandCtrlKey: false,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const a = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'a',
			callback: jumpToStart,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const e = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'e',
			callback: jumpToEnd,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			commandArrowLeft.unregister();
			commandArrowRight.unregister();
			space.unregister();
			enter.unregister();
			a.unregister();
			e.unregister();
		};
	}, [
		jumpToEnd,
		jumpToStart,
		keybindings,
		onEnter,
		onSpace,
		oneFrameBack,
		oneFrameForward,
	]);

	useEffect(() => {
		let timeout: Timer | null = null;
		let stopped = false;

		const onBuffer = () => {
			requestAnimationFrame(() => {
				stopped = false;
				timeout = setTimeout(() => {
					if (!stopped) {
						setShowBufferState(true);
					}
				}, bufferStateDelayInMilliseconds);
			});
		};

		const onResume = () => {
			requestAnimationFrame(() => {
				setShowBufferState(false);
				stopped = true;
				if (timeout) {
					clearTimeout(timeout);
				}
			});
		};

		emitter.addEventListener('waiting', onBuffer);
		emitter.addEventListener('resume', onResume);

		return () => {
			emitter.removeEventListener('waiting', onBuffer);
			emitter.removeEventListener('resume', onResume);

			setShowBufferState(false);

			if (timeout) {
				clearTimeout(timeout);
			}

			stopped = true;
		};
	}, [bufferStateDelayInMilliseconds, emitter]);

	return (
		<>
			<ControlButton
				aria-label="Jump to beginning"
				title="Jump to beginning"
				disabled={!videoConfig || isFirstFrame}
				onClick={jumpToStart}
			>
				<JumpToStart style={backStyle} />
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
					showBufferIndicator ? (
						<PlayerInternals.BufferingIndicator type="studio" />
					) : (
						<Pause style={iconButton} />
					)
				) : (
					<Play style={iconButton} />
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
