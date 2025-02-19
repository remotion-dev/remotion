import type React from 'react';
import {useContext, useEffect} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {CheckerboardContext} from '../state/checkerboard';
import {ModalsContext} from '../state/modals';
import {showNotification} from './Notifications/NotificationCenter';

export const GlobalKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {setSelectedModal} = useContext(ModalsContext);
	const {setCheckerboard} = useContext(CheckerboardContext);

	useEffect(() => {
		const nKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'n',
			callback: () => {
				showNotification(
					`To make a new composition, right-click an existing one and select "Duplicate"`,
					5000,
				);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const cmdKKey = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'k',
			callback: () => {
				setSelectedModal({
					type: 'quick-switcher',
					mode: 'compositions',
					invocationTimestamp: Date.now(),
				});
			},
			triggerIfInputFieldFocused: true,

			keepRegisteredWhenNotHighestContext: false,
			commandCtrlKey: true,
			preventDefault: true,
		});

		const cKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 't',
			callback: () => {
				setCheckerboard((c) => !c);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const questionMark = keybindings.registerKeybinding({
			event: 'keypress',
			key: '?',
			callback: () => {
				setSelectedModal({
					type: 'quick-switcher',
					mode: 'docs',
					invocationTimestamp: Date.now(),
				});
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			nKey.unregister();
			cKey.unregister();
			questionMark.unregister();
			cmdKKey.unregister();
		};
	}, [keybindings, setCheckerboard, setSelectedModal]);

	return null;
};
