import React, {useCallback, useContext} from 'react';
import {BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {MagnetIcon} from '../icons/magnet';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';

export const SnappingToggle: React.FC = () => {
	const {editorSnapping, setEditorSnapping} = useContext(EditorSnappingContext);

	const onClick = useCallback(() => {
		setEditorSnapping((current) => !current);
	}, [setEditorSnapping]);
	const shortcut = useKeyboardShortcutLabel('toggleSnapping');
	const ariaKeyShortcuts =
		useKeyboardShortcutAriaKeyShortcuts('toggleSnapping');

	const accessibilityLabel = editorSnapping
		? 'Disable snapping'
		: 'Enable snapping';
	const shortcutsDisabled = areKeyboardShortcutsDisabled();

	return (
		<ActionTooltip
			label={accessibilityLabel}
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick={false}
		>
			<ControlButton
				title=""
				aria-label={accessibilityLabel}
				aria-pressed={editorSnapping}
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaKeyShortcuts || undefined
				}
				onClick={onClick}
			>
				{(color) => (
					<MagnetIcon
						style={{width: 18, height: 18, transform: 'translateY(1px)'}}
						color={editorSnapping ? BLUE : color}
						aria-hidden="true"
						focusable="false"
					/>
				)}
			</ControlButton>
		</ActionTooltip>
	);
};
