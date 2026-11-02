import {PlayerInternals} from '@remotion/player';
import type React from 'react';
import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';
import {stepPlaybackRate} from '../state/playbackrate';
import {toggleLoop} from './LoopToggle';
import {toggleMute} from './MuteToggle';

export const PlaybackKeyboardShortcutsManager: React.FC<{
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
	readonly setMuted: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setLoop: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({setPlaybackRate, setMuted, setLoop}) => {
	const keybindings = useKeybinding();
	const resolvedConfig = Internals.useResolvedVideoConfig(null);
	const resolvedConfigRef = useRef(resolvedConfig);
	resolvedConfigRef.current = resolvedConfig;
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);
	const canControlPlayback = useCallback(() => {
		const {canvasContent, currentAssetMetadata} = compositionManagerRef.current;
		const resolved = resolvedConfigRef.current;
		const metadata =
			canvasContent?.type === 'asset' &&
			currentAssetMetadata?.asset === canvasContent.asset
				? currentAssetMetadata
				: canvasContent?.type === 'composition' &&
					  (resolved?.type === 'success' ||
							resolved?.type === 'success-and-refreshing') &&
					  resolved.result.id === canvasContent.compositionId
					? resolved.result
					: null;
		return (
			metadata !== null &&
			Number.isFinite(metadata.durationInFrames) &&
			metadata.durationInFrames > 1 &&
			Number.isFinite(metadata.fps) &&
			metadata.fps > 0
		);
	}, [compositionManagerRef]);
	const isVideoComposition = canControlPlayback();

	useEffect(() => {
		if (!isVideoComposition) {
			return;
		}

		const mute = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'toggleMute',
			callback: (event) => {
				if (!canControlPlayback()) return;
				event.preventDefault();
				if (!event.repeat) toggleMute(setMuted);
			},
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const loop = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'toggleLoop',
			callback: (event) => {
				if (!canControlPlayback()) return;
				event.preventDefault();
				if (!event.repeat) toggleLoop(setLoop);
			},
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			mute.unregister();
			loop.unregister();
		};
	}, [canControlPlayback, isVideoComposition, keybindings, setLoop, setMuted]);

	const {play, pause, isPlaying} = PlayerInternals.usePlayerMethods();

	const onJKey = useCallback(
		(event: KeyboardEvent) => {
			if (!canControlPlayback()) return;
			event.preventDefault();
			const wasPlaying = isPlaying();
			setPlaybackRate((prevPlaybackRate) => {
				if (!wasPlaying) {
					return -1;
				}

				if (prevPlaybackRate > -1) {
					return -1;
				}

				if (prevPlaybackRate > -2) {
					return -2;
				}

				return -4;
			});
			play();
		},
		[canControlPlayback, isPlaying, play, setPlaybackRate],
	);

	const onKKey = useCallback(
		(event: KeyboardEvent) => {
			if (!canControlPlayback()) return;
			event.preventDefault();
			setPlaybackRate(1);
			pause();
		},
		[canControlPlayback, pause, setPlaybackRate],
	);

	const onLKey = useCallback(
		(event: KeyboardEvent) => {
			if (!canControlPlayback()) return;
			event.preventDefault();
			const wasPlaying = isPlaying();
			setPlaybackRate((prevPlaybackRate) => {
				if (!wasPlaying) {
					return 1;
				}

				if (prevPlaybackRate < 1) {
					return 1;
				}

				if (prevPlaybackRate < 2) {
					return 2;
				}

				return 4;
			});
			play();
		},
		[canControlPlayback, isPlaying, play, setPlaybackRate],
	);

	useEffect(() => {
		if (!isVideoComposition) return;
		const jKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'reversePlayback',
			callback: onJKey,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const kKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'pausePlayback',
			callback: onKKey,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const lKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'playForward',
			callback: onLKey,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const decrease = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'decreasePlaybackRate',
			callback: (event) => {
				if (!canControlPlayback()) return;
				event.preventDefault();
				setPlaybackRate((prevPlaybackRate) =>
					stepPlaybackRate(prevPlaybackRate, -1),
				);
			},
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const increase = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'increasePlaybackRate',
			callback: (event) => {
				if (!canControlPlayback()) return;
				event.preventDefault();
				setPlaybackRate((prevPlaybackRate) =>
					stepPlaybackRate(prevPlaybackRate, 1),
				);
			},
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			jKey.unregister();
			kKey.unregister();
			lKey.unregister();
			decrease.unregister();
			increase.unregister();
		};
	}, [
		canControlPlayback,
		isVideoComposition,
		keybindings,
		onJKey,
		onKKey,
		onLKey,
		setPlaybackRate,
	]);

	return null;
};
