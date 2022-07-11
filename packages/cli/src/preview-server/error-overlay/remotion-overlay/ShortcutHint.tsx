import React from 'react';

const cmdOrCtrlCharacter = window.navigator.platform.startsWith('Mac')
	? '⌘'
	: 'Ctrl';

const container: React.CSSProperties = {
	display: 'inline-block',
	marginLeft: 6,
	opacity: 0.6,
};

export const ShortcutHint: React.FC<{
	keyToPress: string;
	cmdOrCtrl: boolean;
}> = ({keyToPress, cmdOrCtrl}) => {
	return (
		<span style={container}>
			{cmdOrCtrl ? `${cmdOrCtrlCharacter}+` : ''}
			{keyToPress.toUpperCase()}
		</span>
	);
};
