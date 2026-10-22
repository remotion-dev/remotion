import React, {useCallback} from 'react';
import {BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {persistLoopOption} from '../state/loop';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';

const accessibilityLabel = 'Loop';
const buttonStyle: React.CSSProperties = {width: 30};

export const toggleLoop = (
	setLoop: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	setLoop((currentLoop) => {
		persistLoopOption(!currentLoop);
		return !currentLoop;
	});
};

export const LoopToggle: React.FC<{
	readonly loop: boolean;
	readonly setLoop: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({loop, setLoop}) => {
	const shortcut = useKeyboardShortcutLabel('toggleLoop');
	const ariaShortcut = useKeyboardShortcutAriaKeyShortcuts('toggleLoop');
	const shortcutsDisabled = areKeyboardShortcutsDisabled();
	const onClick = useCallback(() => {
		toggleLoop(setLoop);
	}, [setLoop]);

	return (
		<ActionTooltip
			label={accessibilityLabel}
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick={false}
		>
			<ControlButton
				aria-label={accessibilityLabel}
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaShortcut || undefined
				}
				aria-pressed={loop}
				onClick={onClick}
				style={buttonStyle}
			>
				{(color) => (
					<svg viewBox="0 0 18 18" style={{width: 18, height: 18}}>
						<path
							fill="none"
							stroke={loop ? BLUE : color}
							strokeWidth="1"
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M0.5 9.5a6 6 0 0 1 6 -6h6M12.5 0.5l4 3 -4 3zM17.5 8.5a6 6 0 0 1 -6 6h-6M5.5 11.5l-4 3 4 3z"
						/>
					</svg>
				)}
			</ControlButton>
		</ActionTooltip>
	);
};
