import React, {useMemo} from 'react';
import {areKeyboardShortcutsDisabled} from '../../helpers/use-keybinding';

export const cmdOrCtrlCharacter =
	typeof window !== 'undefined' && window.navigator.platform.startsWith('Mac')
		? '⌘'
		: 'Ctrl';

const container: React.CSSProperties = {
	display: 'inline-block',
	marginLeft: 6,
	opacity: 0.6,
	verticalAlign: 'middle',
	fontSize: 'inherit',
};

export const ShortcutHint: React.FC<{
	readonly keyToPress: string;
	readonly cmdOrCtrl: boolean;
}> = ({keyToPress, cmdOrCtrl}) => {
	const style = useMemo((): React.CSSProperties => {
		if (keyToPress === '↵') {
			return {
				display: 'inline-block',
				transform: `translateY(2px)`,
				fontSize: 'inherit',
			};
		}

		return {
			fontSize: 'inherit',
		};
	}, [keyToPress]);
	if (areKeyboardShortcutsDisabled()) {
		return null;
	}

	return (
		<span style={container}>
			{cmdOrCtrl ? `${cmdOrCtrlCharacter}` : ''}
			<span style={style}>{keyToPress.toUpperCase()}</span>
		</span>
	);
};
