import React, {useCallback, useContext} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {BLUE, WHITE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {MagnetIcon} from '../icons/magnet';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ControlButton} from './ControlButton';

export const SnappingToggle: React.FC<{
	readonly disabled: boolean;
}> = ({disabled}) => {
	const {editorSnapping, setEditorSnapping} = useContext(EditorSnappingContext);

	const onClick = useCallback(() => {
		setEditorSnapping((current) => !current);
	}, [setEditorSnapping]);

	const color = editorSnapping ? BLUE : WHITE;
	const accessibilityLabel = [
		editorSnapping ? 'Disable snapping' : 'Enable snapping',
		areKeyboardShortcutsDisabled() ? null : '(Shift+M)',
	]
		.filter(NoReactInternals.truthy)
		.join(' ');

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			aria-pressed={editorSnapping}
			aria-keyshortcuts="Shift+M"
			disabled={disabled}
			onClick={onClick}
		>
			<MagnetIcon
				style={{width: 17, height: 17}}
				fill={color}
				aria-hidden="true"
				focusable="false"
			/>
		</ControlButton>
	);
};
