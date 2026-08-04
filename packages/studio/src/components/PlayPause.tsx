import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
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

type PlayerMethods = ReturnType<typeof PlayerInternals.usePlayer>;

type PlaybackControllerProps = {
	readonly playerRef: React.RefObject<PlayerMethods | null>;
	readonly onPlayingChange: React.Dispatch<React.SetStateAction<boolean>>;
	readonly playbackRate: number;
	readonly loop: boolean;
	readonly muted: boolean;
	readonly inFrame: number | null;
	readonly outFrame: number | null;
};

// usePlayer() must follow the current frame for playback bookkeeping. Keep that
// subscription in a non-rendering leaf so the visible controls stay stable.
const PlaybackControllerInner: React.FC<PlaybackControllerProps> = ({
	playerRef,
	onPlayingChange,
	playbackRate,
	loop,
	muted,
	inFrame,
	outFrame,
}) => {
	const player = PlayerInternals.usePlayer();
	playerRef.current = player;

	useEffect(() => {
		onPlayingChange(player.playing);
	}, [onPlayingChange, player.playing]);

	PlayerInternals.usePlayback({
		loop,
		playbackRate,
		moveToBeginningWhenEnded: true,
		inFrame,
		outFrame,
		getCurrentFrame: player.getCurrentFrame,
		browserMediaControlsBehavior: {
			mode: 'register-media-session',
		},
		muted,
	});

	return null;
};

const PlaybackController = React.memo(PlaybackControllerInner);

type PlayPauseProps = {
	readonly playbackRate: number;
	readonly loop: boolean;
	readonly bufferStateDelayInMilliseconds: number;
	readonly muted: boolean;
	readonly hideNavigationControls: boolean;
};

const PlayPauseInner: React.FC<PlayPauseProps> = ({
	playbackRate,
	loop,
	bufferStateDelayInMilliseconds,
	muted,
	hideNavigationControls,
}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [showBufferIndicator, setShowBufferState] = useState<boolean>(false);
	const [playing, setPlaying] = useState(false);
	const playerRef = useRef<PlayerMethods | null>(null);
	const emitter = useContext(PlayerInternals.PlayerEventEmitterContext);
	if (!emitter) {
		throw new Error('Expected Player event emitter context');
	}

	const play = useCallback((e?: React.SyntheticEvent | PointerEvent) => {
		playerRef.current?.play(e);
	}, []);
	const pause = useCallback(() => {
		playerRef.current?.pause();
	}, []);

	const isStill = useIsStill();

	useEffect(() => {
		if (isStill) {
			pause();
		}
	}, [isStill, pause]);

	const onSpace = useCallback(
		(e: KeyboardEvent) => {
			if (playerRef.current?.isPlaying()) {
				pause();
			} else {
				play();
			}

			e.preventDefault();
		},
		[pause, play],
	);

	const onEnter = useCallback((e: KeyboardEvent) => {
		if (playerRef.current?.isPlaying()) {
			// Don't prevent keyboard navigation
			e.preventDefault();
			playerRef.current.pauseAndReturnToPlayStart();
		}
	}, []);

	const oneFrameBack = useCallback(() => {
		const player = playerRef.current;
		if (!player) {
			return;
		}

		player.frameBack(1);
		ensureFrameIsInViewport({
			direction: 'fit-left',
			durationInFrames: getCurrentDuration(),
			frame: Math.max(0, player.getCurrentFrame() - 1),
		});
	}, []);

	const oneFrameForward = useCallback(() => {
		const player = playerRef.current;
		if (!player) {
			return;
		}

		player.frameForward(1);
		ensureFrameIsInViewport({
			direction: 'fit-right',
			durationInFrames: getCurrentDuration(),
			frame: Math.min(getCurrentDuration() - 1, player.getCurrentFrame() + 1),
		});
	}, []);

	const jumpToStart = useCallback(() => {
		playerRef.current?.seek(inFrame ?? 0);
	}, [inFrame]);

	const jumpToEnd = useCallback(() => {
		playerRef.current?.seek(outFrame ?? getCurrentDuration() - 1);
	}, [outFrame]);

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

	useEffect(() => {
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);

		emitter.addEventListener('play', onPlay);
		emitter.addEventListener('pause', onPause);

		return () => {
			emitter.removeEventListener('play', onPlay);
			emitter.removeEventListener('pause', onPause);
		};
	}, [emitter]);

	return (
		<>
			<PlaybackController
				playerRef={playerRef}
				onPlayingChange={setPlaying}
				playbackRate={playbackRate}
				loop={loop}
				muted={muted}
				inFrame={inFrame}
				outFrame={outFrame}
			/>
			{hideNavigationControls ? null : (
				<ControlButton
					aria-label="Jump to beginning"
					title="Jump to beginning"
					disabled={!videoConfig}
					onClick={jumpToStart}
				>
					{(color) => <JumpToStart style={backStyle} color={color} />}
				</ControlButton>
			)}
			{hideNavigationControls ? null : (
				<ControlButton
					aria-label="Step back one frame"
					title="Step back one frame"
					disabled={!videoConfig}
					onClick={oneFrameBack}
				>
					{(color) => <StepBack style={forwardBackStyle} color={color} />}
				</ControlButton>
			)}

			<ControlButton
				aria-label={playing ? 'Pause' : 'Play'}
				title={playing ? 'Pause' : 'Play'}
				onClick={playing ? pause : play}
				disabled={!videoConfig}
			>
				{(color) =>
					playing ? (
						showBufferIndicator ? (
							<PlayerInternals.BufferingIndicator type="studio" color={color} />
						) : (
							<Pause style={iconButton} color={color} />
						)
					) : (
						<Play style={iconButton} color={color} />
					)
				}
			</ControlButton>

			{hideNavigationControls ? null : (
				<ControlButton
					aria-label="Step forward one frame"
					title="Step forward one frame"
					disabled={!videoConfig}
					onClick={oneFrameForward}
				>
					{(color) => <StepForward style={forwardBackStyle} color={color} />}
				</ControlButton>
			)}
		</>
	);
};

export const PlayPause = React.memo(PlayPauseInner);
