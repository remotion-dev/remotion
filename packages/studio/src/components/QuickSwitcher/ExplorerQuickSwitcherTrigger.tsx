import React, {useCallback, useContext} from 'react';
import {cmdOrCtrlCharacter} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {
	BLACK_HEX,
	LIGHT_TEXT,
	WHITE,
	WHITE_ALPHA_06,
} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {areKeyboardShortcutsDisabled} from '../../helpers/use-keybinding';
import {EllipsisIcon} from '../../icons/ellipsis';
import {SetSelectedModalContext} from '../../state/modals';
import type {RenderInlineAction} from '../InlineAction';
import {InlineDropdown} from '../InlineDropdown';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import type {QuickSwitcherMode} from './NoResults';

const quickSwitcherArea: React.CSSProperties = {
	padding: '4px 4px 4px 8px',
	borderBottom: `1px solid ${BLACK_HEX}`,
	overflowY: 'auto',
	display: 'flex',
	alignItems: 'center',
	gap: 4,
};

const quickSwitcherTrigger: React.CSSProperties = {
	borderRadius: 4,
	padding: '4px 10px 4px 12px',
	fontSize: 12,
	cursor: 'default',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	border: 'none',
	flex: 1,
	appearance: 'none',
	...hoverableStyle({
		idleBackground: WHITE_ALPHA_06,
		hoverBackground: WHITE_ALPHA_06,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
};

const ellipsisSvgProps: React.SVGProps<SVGSVGElement> = {
	style: {
		height: 12,
	},
};

const shortcutLabel: React.CSSProperties = {
	fontSize: 11,
	opacity: 0.6,
};

export const ExplorerQuickSwitcherTrigger: React.FC<{
	readonly mode: QuickSwitcherMode;
	readonly showShortcut: boolean;
	readonly tabIndex: number;
	readonly getActions: () => ComboboxValue[];
}> = ({mode, showShortcut, tabIndex, getActions}) => {
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
	const renderMoreActions: RenderInlineAction = useCallback((color) => {
		return <EllipsisIcon svgProps={ellipsisSvgProps} fill={color} />;
	}, []);
	const moreActionsTitle =
		mode === 'assets' ? 'More asset actions' : 'More composition actions';

	return (
		<div style={quickSwitcherArea} className="__remotion-vertical-scrollbar">
			<button
				type="button"
				style={quickSwitcherTrigger}
				onClick={openQuickSwitcher}
				tabIndex={tabIndex}
				className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
			>
				Search...
				{showShortcut && !areKeyboardShortcutsDisabled() ? (
					<span style={shortcutLabel}>{cmdOrCtrlCharacter}+K</span>
				) : null}
			</button>
			<InlineDropdown
				variant={null}
				title={moreActionsTitle}
				renderAction={renderMoreActions}
				getItems={getActions}
				className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
			/>
		</div>
	);
};
