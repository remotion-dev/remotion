import {PlayerInternals} from '@remotion/player';
import type React from 'react';
import {useCallback, useEffect} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';

export const PlaybackKeyboardShortcutsManager: React.FC<{
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
}> = ({setPlaybackRate}) => {
	const keybindings = useKeybinding();

	const {play, pause, isPlaying} = PlayerInternals.usePlayerMethods();

	const onJKey = useCallback(() => {
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
	}, [isPlaying, play, setPlaybackRate]);

	const onKKey = useCallback(() => {
		setPlaybackRate(1);
		pause();
	}, [pause, setPlaybackRate]);

	const onLKey = useCallback(() => {
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
	}, [isPlaying, play, setPlaybackRate]);

	useEffect(() => {
		const jKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'j',
			callback: onJKey,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const kKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'k',
			callback: onKKey,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const lKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'l',
			callback: onLKey,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			jKey.unregister();
			kKey.unregister();
			lKey.unregister();
		};
	}, [keybindings, onJKey, onKKey, onLKey]);

	return null;
};
