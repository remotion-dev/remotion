import React, {useCallback, useContext} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {MagnetIcon} from '../icons/magnet';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ControlButton} from './ControlButton';

export const SnappingToggle: React.FC = () => {
	const {editorSnapping, setEditorSnapping} = useContext(EditorSnappingContext);

	const onClick = useCallback(() => {
		setEditorSnapping((current) => !current);
	}, [setEditorSnapping]);

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
	);
};
