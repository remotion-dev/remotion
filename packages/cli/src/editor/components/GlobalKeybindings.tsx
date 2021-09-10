import React, {useContext, useEffect} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {CheckerboardContext} from '../state/checkerboard';
import {ModalsContext} from '../state/modals';

export const GlobalKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {setSelectedModal} = useContext(ModalsContext);
	const {setCheckerboard} = useContext(CheckerboardContext);

	useEffect(() => {
		const nKey = keybindings.registerKeybinding('keypress', 'n', () => {
			setSelectedModal('new-comp');
		});
		const cKey = keybindings.registerKeybinding('keypress', 'c', () => {
			setCheckerboard((c) => !c);
		});

		return () => {
			nKey.unregister();
			cKey.unregister();
		};
	}, [keybindings, setCheckerboard, setSelectedModal]);

	return null;
};
