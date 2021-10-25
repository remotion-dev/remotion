import {useCallback} from 'react';
import React, {useEffect} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {PlayerInternals} from '@remotion/player';

export const PlaybackKeyboardShortcutsManager: React.FC<{
	setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
}> = ({setPlaybackRate}) => {
	const keybindings = useKeybinding();

	const {play, pause} = PlayerInternals.usePlayer();

	const onJKey = useCallback(() => {
		setPlaybackRate((prevPlaybackRate) => {
			if (prevPlaybackRate > 0) {
				return -1;
			}

			if (prevPlaybackRate === -1) {
				return -2;
			}

			if (prevPlaybackRate === -2) {
				return -4;
			}

			if (prevPlaybackRate === -4) {
				return -4;
			}

			throw new Error(
				'unexpected previous playrate when pressing J: ' + prevPlaybackRate
			);
		});
		play();
	}, [play, setPlaybackRate]);

	const onKKey = useCallback(() => {
		setPlaybackRate(1);
		pause();
	}, [pause, setPlaybackRate]);

	const onLKey = useCallback(() => {
		setPlaybackRate((prevPlaybackRate) => {
			if (prevPlaybackRate < 0) {
				return 1;
			}

			if (prevPlaybackRate === 1) {
				return 2;
			}

			if (prevPlaybackRate === 2) {
				return 4;
			}

			if (prevPlaybackRate === 4) {
				return 4;
			}

			throw new Error(
				'unexpected previous playrate when pressing J: ' + prevPlaybackRate
			);
		});
		play();
	}, [play, setPlaybackRate]);

	useEffect(() => {
		const jKey = keybindings.registerKeybinding('keydown', 'j', onJKey);
		const kKey = keybindings.registerKeybinding('keydown', 'k', onKKey);
		const lKey = keybindings.registerKeybinding('keydown', 'l', onLKey);

		return () => {
			jKey.unregister();
			kKey.unregister();
			lKey.unregister();
		};
	}, [keybindings, onJKey, onKKey, onLKey]);

	return null;
};
