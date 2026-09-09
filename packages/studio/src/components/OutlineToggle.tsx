import React, {useCallback, useContext} from 'react';
import {BACKGROUND_HEX, BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutLabel,
	useKeyboardShortcutAriaKeyShortcuts,
} from '../helpers/use-keyboard-shortcut-label';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';

export const OutlineToggle: React.FC = () => {
	const {editorShowOutlines, setEditorShowOutlines} = useContext(
		EditorShowOutlinesContext,
	);

	const onClick = useCallback(() => {
		setEditorShowOutlines((current) => !current);
	}, [setEditorShowOutlines]);

	const shortcut = useKeyboardShortcutLabel('toggleOutlines');
	const ariaShortcut = useKeyboardShortcutAriaKeyShortcuts('toggleOutlines');
	const shortcutsDisabled = areKeyboardShortcutsDisabled();

	const accessibilityLabel = editorShowOutlines
		? 'Hide outlines'
		: 'Show outlines';

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
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaShortcut || undefined
				}
				aria-pressed={editorShowOutlines}
				onClick={onClick}
			>
				{(color) => {
					const iconColor = editorShowOutlines ? BLUE : color;
					return (
						<svg
							style={{width: 17, height: 17}}
							viewBox="0 0 512 512"
							fill="none"
							aria-hidden="true"
							focusable="false"
						>
							<path
								d="M64 64H448V448H64V64Z"
								stroke={iconColor}
								strokeWidth="36"
							/>
							{[
								[16, 16],
								[400, 16],
								[16, 400],
								[400, 400],
							].map(([x, y]) => (
								<rect
									key={`${x}-${y}`}
									x={x}
									y={y}
									width="96"
									height="96"
									rx="24"
									fill={BACKGROUND_HEX}
									stroke={iconColor}
									strokeWidth="32"
								/>
							))}
						</svg>
					);
				}}
			</ControlButton>
		</ActionTooltip>
	);
};
