import type React from 'react';
import {useContext, useEffect} from 'react';
import {useKeybinding} from '../helpers/use-keybinding';
import {CheckerboardContext} from '../state/checkerboard';
import {ModalsContext} from '../state/modals';
import {askAiModalRef} from './AskAiModal';
import {useCompositionNavigation} from './CompositionSelector';
import {showNotification} from './Notifications/NotificationCenter';

export const GlobalKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const {setSelectedModal} = useContext(ModalsContext);
	const {setCheckerboard} = useContext(CheckerboardContext);
	const {navigateToNextComposition, navigateToPreviousComposition} =
		useCompositionNavigation();

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
		const cmdIKey = process.env.ASK_AI_ENABLED
			? keybindings.registerKeybinding({
					event: 'keydown',
					key: 'i',
					callback: () => {
						askAiModalRef.current?.toggle();
					},
					triggerIfInputFieldFocused: true,
					keepRegisteredWhenNotHighestContext: true,
					commandCtrlKey: true,
					preventDefault: true,
				})
			: null;

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

		const pageDown = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'PageDown',
			callback: navigateToNextComposition,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		const pageUp = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'PageUp',
			callback: navigateToPreviousComposition,
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
			cmdIKey?.unregister();
			pageDown.unregister();
			pageUp.unregister();
		};
	}, [
		keybindings,
		setCheckerboard,
		setSelectedModal,
		navigateToNextComposition,
		navigateToPreviousComposition,
	]);

	return null;
};
