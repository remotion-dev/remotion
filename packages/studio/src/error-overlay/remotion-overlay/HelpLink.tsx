import React, {useCallback, useEffect} from 'react';
import {Button} from '../../components/Button';
import {BLUE} from '../../helpers/colors';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ShortcutHint} from './ShortcutHint';
import type {THelpLink} from './get-help-link';

const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

export const HelpLink: React.FC<{
	readonly canHaveKeyboardShortcuts: boolean;
	readonly link: THelpLink;
}> = ({canHaveKeyboardShortcuts, link}) => {
	const openLink = useCallback(() => {
		window.open(link.url, '_blank');
	}, [link]);
	const {registerKeybinding} = useKeybinding();

	useEffect(() => {
		if (!canHaveKeyboardShortcuts) {
			return;
		}

		const onEditor = () => {
			openLink();
		};

		const {unregister} = registerKeybinding({
			event: 'keydown',
			key: 'h',
			callback: onEditor,
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => unregister();
	}, [canHaveKeyboardShortcuts, openLink, registerKeybinding]);

	return (
		<Button style={buttonStyle} onClick={openLink}>
			Help: {'"'}
			{link.title}
			{'"'}
			{canHaveKeyboardShortcuts ? (
				<ShortcutHint keyToPress="h" cmdOrCtrl />
			) : null}
		</Button>
	);
};
