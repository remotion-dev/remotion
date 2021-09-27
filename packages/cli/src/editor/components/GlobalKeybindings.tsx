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
			setSelectedModal({
				type: 'new-comp',
				compType: 'composition',
			});
		});

		const cKey = keybindings.registerKeybinding('keypress', 't', () => {
			setCheckerboard((c) => !c);
		});
		const questionMark = keybindings.registerKeybinding('keypress', '?', () => {
			setSelectedModal({
				type: 'shortcuts',
			});
		});

		return () => {
			nKey.unregister();
			cKey.unregister();
			questionMark.unregister();
		};
	}, [keybindings, setCheckerboard, setSelectedModal]);

	return null;
};
