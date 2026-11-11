import {useContext, useMemo} from 'react';
import {Checkmark} from '../icons/Checkmark';
import {AudioLevelsContext} from '../state/audio-levels';
import type {SelectionItem} from './NewComposition/ComboBox';

export const useAudioLevelsMenuItem = (closeMenu: (() => void) | null) => {
	const {visible, setVisible} = useContext(AudioLevelsContext);
	return useMemo(
		(): SelectionItem => ({
			id: 'audio-levels',
			type: 'item',
			label: 'Audio Levels',
			value: 'audio-levels',
			keyHint: null,
			leftItem: visible ? <Checkmark /> : null,
			subMenu: null,
			quickSwitcherLabel: visible ? 'Hide Audio Levels' : 'Show Audio Levels',
			onClick: () => {
				closeMenu?.();
				setVisible((previous) => !previous);
			},
		}),
		[closeMenu, visible, setVisible],
	);
};
