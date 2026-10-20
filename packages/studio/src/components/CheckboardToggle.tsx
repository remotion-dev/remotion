import React, {useCallback, useContext} from 'react';
import {BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {CheckerboardContext} from '../state/checkerboard';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';

const buttonStyle: React.CSSProperties = {width: 26};

export const CheckboardToggle: React.FC = () => {
	const {checkerboard, setCheckerboard} = useContext(CheckerboardContext);

	const onClick = useCallback(() => {
		setCheckerboard((c) => {
			return !c;
		});
	}, [setCheckerboard]);
	const shortcut = useKeyboardShortcutLabel('toggleCheckerboard');
	const ariaKeyShortcuts =
		useKeyboardShortcutAriaKeyShortcuts('toggleCheckerboard');
	const accessibilityLabel = 'Show transparency as checkerboard';
	const shortcutsDisabled = areKeyboardShortcutsDisabled();

	return (
		<ActionTooltip
			label="Checkerboard"
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick={false}
		>
			<ControlButton
				aria-label={accessibilityLabel}
				aria-pressed={checkerboard}
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaKeyShortcuts || undefined
				}
				onClick={onClick}
				style={buttonStyle}
			>
				{(color) => (
					<svg
						aria-hidden="true"
						focusable="false"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 18 18"
						style={{width: 18, height: 18}}
						fill="none"
					>
						<path
							fill={checkerboard ? BLUE : color}
							fillRule="evenodd"
							d="M3 2h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1H3a1 1 0 0 1 -1 -1V3a1 1 0 0 1 1 -1zM3 3h6v6H3zM9 9h6v6H9z"
						/>
					</svg>
				)}
			</ControlButton>
		</ActionTooltip>
	);
};
