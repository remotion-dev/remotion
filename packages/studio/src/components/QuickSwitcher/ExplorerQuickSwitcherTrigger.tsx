import React, {useCallback, useContext} from 'react';
import {cmdOrCtrlCharacter} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {BLACK_HEX, LIGHT_TEXT, WHITE_ALPHA_06} from '../../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../../helpers/use-keybinding';
import {SetSelectedModalContext} from '../../state/modals';
import type {QuickSwitcherMode} from './NoResults';

const quickSwitcherArea: React.CSSProperties = {
	padding: '4px 12px',
	borderBottom: `1px solid ${BLACK_HEX}`,
};

const quickSwitcherTrigger: React.CSSProperties = {
	backgroundColor: WHITE_ALPHA_06,
	borderRadius: 5,
	padding: '4px 10px',
	color: LIGHT_TEXT,
	fontSize: 12,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	border: 'none',
	width: '100%',
	appearance: 'none',
};

const shortcutLabel: React.CSSProperties = {
	fontSize: 11,
	opacity: 0.6,
};

export const ExplorerQuickSwitcherTrigger: React.FC<{
	readonly mode: QuickSwitcherMode;
	readonly showShortcut: boolean;
	readonly tabIndex: number;
}> = ({mode, showShortcut, tabIndex}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const openQuickSwitcher = useCallback(() => {
		setSelectedModal({
			type: 'quick-switcher',
			mode,
			invocationTimestamp: Date.now(),
			assetSelection: null,
			compositionSelection: null,
		});
	}, [mode, setSelectedModal]);

	return (
		<div style={quickSwitcherArea}>
			<button
				type="button"
				style={quickSwitcherTrigger}
				onClick={openQuickSwitcher}
				tabIndex={tabIndex}
			>
				Search...
				{showShortcut && !areKeyboardShortcutsDisabled() ? (
					<span style={shortcutLabel}>{cmdOrCtrlCharacter}+K</span>
				) : null}
			</button>
		</div>
	);
};
