const DISCORD_LINK = 'https://remotion.dev/discord';

import React, {useCallback, useEffect} from 'react';
import {Button} from '../../components/Button';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ShortcutHint} from './ShortcutHint';

export const AskOnDiscord: React.FC<{
	readonly canHaveKeyboardShortcuts: boolean;
}> = ({canHaveKeyboardShortcuts}) => {
	const openInBrowser = useCallback(() => {
		window.open(DISCORD_LINK, '_blank');
	}, []);

	const {registerKeybinding} = useKeybinding();

	useEffect(() => {
		if (!canHaveKeyboardShortcuts) {
			return;
		}

		const onEditor = () => {
			openInBrowser();
		};

		const {unregister} = registerKeybinding({
			event: 'keydown',
			key: 'd',
			callback: onEditor,
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => unregister();
	}, [canHaveKeyboardShortcuts, openInBrowser, registerKeybinding]);

	return (
		<Button onClick={openInBrowser}>
			Ask on Discord{' '}
			{canHaveKeyboardShortcuts ? (
				<ShortcutHint keyToPress="d" cmdOrCtrl />
			) : null}
		</Button>
	);
};
