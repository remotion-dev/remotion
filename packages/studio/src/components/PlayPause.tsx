import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {JumpToStart} from '../icons/jump-to-start';
import {Pause} from '../icons/pause';
import {Play} from '../icons/play';
import {StepBack} from '../icons/step-back';
import {StepForward} from '../icons/step-forward';
import {useTimelineInOutFramePosition} from '../state/in-out';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';
import {getCurrentDuration} from './Timeline/imperative-state';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';

const backStyle = {
	height: 18,
};

const forwardBackStyle = {
	height: 16,
};

const iconButton: React.CSSProperties = {
	height: 14,
	width: 14,
};

const browserMediaControlsBehavior = {
	mode: 'register-media-session',
} as const;

const PlaybackManager: React.FC<{
	readonly playbackRate: number;
	readonly loop: boolean;
	readonly muted: boolean;
	readonly inFrame: number | null;
	readonly outFrame: number | null;
	readonly getCurrentFrame: () => number;
}> = ({playbackRate, loop, muted, inFrame, outFrame, getCurrentFrame}) => {
	PlayerInternals.usePlayback({
		loop,
		playbackRate,
		moveToBeginningWhenEnded: true,
		inFrame,
		outFrame,
		getCurrentFrame,
		browserMediaControlsBehavior,
		muted,
	});

	return null;
};

const PlayPauseInner: React.FC<{
	readonly playbackRate: number;
	readonly loop: boolean;
	readonly bufferStateDelayInMilliseconds: number;
	readonly muted: boolean;
	readonly hideNavigationControls: boolean;
}> = ({
	playbackRate,
	loop,
	bufferStateDelayInMilliseconds,
	muted,
	hideNavigationControls,
}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [showBufferIndicator, setShowBufferState] = useState<boolean>(false);

	const {
		play,
		pause,
		pauseAndReturnToPlayStart,
		frameBack,
		seek,
		frameForward,
		emitter,
		getCurrentFrame,
	} = PlayerInternals.usePlayerMethods();
	const playing = Internals.usePlaying();

	const isStill = useIsStill();
	const jumpToBeginningShortcut = useKeyboardShortcutLabel('jumpToBeginning');
	const jumpToBeginningAriaShortcut =
		useKeyboardShortcutAriaKeyShortcuts('jumpToBeginning');
	const playPauseShortcut = useKeyboardShortcutLabel('playPause');
	const playPauseAriaShortcut =
		useKeyboardShortcutAriaKeyShortcuts('playPause');

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
			action: 'playPause',
			callback: onSpace,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const enter = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'pauseAndReturnToPlaybackStart',
			callback: onEnter,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const a = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'jumpToBeginning',
			callback: jumpToStart,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const e = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'jumpToEnd',
			callback: jumpToEnd,
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
			<PlaybackManager
				loop={loop}
				playbackRate={playbackRate}
				muted={muted}
				inFrame={inFrame}
				outFrame={outFrame}
				getCurrentFrame={getCurrentFrame}
			/>
			{hideNavigationControls ? null : (
				<ActionTooltip
					label="Go to beginning"
					shortcut={jumpToBeginningShortcut}
					delay={800}
					dismissOnClick
				>
					<ControlButton
						aria-label="Go to beginning"
						aria-keyshortcuts={jumpToBeginningAriaShortcut || undefined}
						title=""
						disabled={!videoConfig}
						onClick={jumpToStart}
					>
						{(color) => <JumpToStart style={backStyle} color={color} />}
					</ControlButton>
				</ActionTooltip>
			)}
			{hideNavigationControls ? null : (
				<ActionTooltip
					label="Go back 1 frame"
					shortcut="←"
					delay={800}
					dismissOnClick
				>
					<ControlButton
						aria-label="Go back 1 frame"
						aria-keyshortcuts="ArrowLeft"
						title=""
						disabled={!videoConfig}
						onClick={oneFrameBack}
					>
						{(color) => <StepBack style={forwardBackStyle} color={color} />}
					</ControlButton>
				</ActionTooltip>
			)}

			<ActionTooltip
				label={playing ? 'Pause' : 'Play'}
				shortcut={playPauseShortcut}
				delay={800}
				dismissOnClick={false}
			>
				<ControlButton
					aria-label={playing ? 'Pause' : 'Play'}
					aria-keyshortcuts={playPauseAriaShortcut || undefined}
					title=""
					onClick={playing ? pause : play}
					disabled={!videoConfig}
				>
					{(color) =>
						playing ? (
							showBufferIndicator ? (
								<PlayerInternals.BufferingIndicator
									type="studio"
									color={color}
								/>
							) : (
								<Pause style={iconButton} color={color} />
							)
						) : (
							<Play style={iconButton} color={color} />
						)
					}
				</ControlButton>
			</ActionTooltip>

			{hideNavigationControls ? null : (
				<ActionTooltip
					label="Go forward 1 frame"
					shortcut="→"
					delay={800}
					dismissOnClick
				>
					<ControlButton
						aria-label="Go forward 1 frame"
						aria-keyshortcuts="ArrowRight"
						title=""
						disabled={!videoConfig}
						onClick={oneFrameForward}
					>
						{(color) => <StepForward style={forwardBackStyle} color={color} />}
					</ControlButton>
				</ActionTooltip>
			)}
		</>
	);
};

export const PlayPause = React.memo(PlayPauseInner);
