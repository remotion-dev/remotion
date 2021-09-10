import React, {useContext, useEffect} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {ModalsContext} from '../state/modals';

export const GlobalKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {setSelectedModal} = useContext(ModalsContext);

	useEffect(() => {
		const binding = keybindings.registerKeybinding('keypress', 'N', () => {
			setSelectedModal('new-comp');
		});
		const lowerCaseN = keybindings.registerKeybinding('keypress', 'n', () => {
			setSelectedModal('new-comp');
		});

		return () => {
			binding.unregister();
			lowerCaseN.unregister();
		};
	}, [keybindings, setSelectedModal]);

	return null;
};
