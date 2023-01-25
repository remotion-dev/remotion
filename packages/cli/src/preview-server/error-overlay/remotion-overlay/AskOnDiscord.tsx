const DISCORD_LINK = 'https://remotion.dev/discord';

import React, {useCallback, useEffect} from 'react';
import {useKeybinding} from '../../../editor/helpers/use-keybinding';
import {Button} from './Button';
import {ShortcutHint} from './ShortcutHint';

export const AskOnDiscord: React.FC<{
	canHaveKeyboardShortcuts: boolean;
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
