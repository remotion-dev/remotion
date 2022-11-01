import React, {useCallback, useEffect} from 'react';
import {useKeybinding} from '../../../editor/helpers/use-keybinding';
import {Button} from './Button';
import {ShortcutHint} from './ShortcutHint';

export const SearchGithubIssues: React.FC<{
	message: string;
	canHaveKeyboardShortcuts: boolean;
}> = ({message, canHaveKeyboardShortcuts}) => {
	const openInBrowser = useCallback(() => {
		window.open(
			`https://github.com/remotion-dev/remotion/issues?q=${encodeURIComponent(
				message
			)}`,
			'_blank'
		);
	}, [message]);
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
			key: 'g',
			callback: onEditor,
			commandCtrlKey: true,
			preventDefault: true,
		});
		return () => unregister();
	}, [canHaveKeyboardShortcuts, openInBrowser, registerKeybinding]);

	return (
		<Button onClick={openInBrowser}>
			Search GitHub Issues{' '}
			{canHaveKeyboardShortcuts ? (
				<ShortcutHint keyToPress="g" cmdOrCtrl />
			) : null}
		</Button>
	);
};
