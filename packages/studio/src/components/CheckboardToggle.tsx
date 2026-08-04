import React, {useCallback, useContext} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {CheckerboardContext} from '../state/checkerboard';
import {ControlButton} from './ControlButton';

const accessibilityLabel = [
	'Show transparency as checkerboard',
	areKeyboardShortcutsDisabled() ? null : '(T)',
]
	.filter(NoReactInternals.truthy)
	.join(' ');

export const CheckboardToggle: React.FC = () => {
	const {checkerboard, setCheckerboard} = useContext(CheckerboardContext);

	const onClick = useCallback(() => {
		setCheckerboard((c) => {
			return !c;
		});
	}, [setCheckerboard]);

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			{(color) => (
				<svg
					aria-hidden="true"
					focusable="false"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					style={{width: 18, height: 18}}
					fill="none"
				>
					<path
						fill={checkerboard ? BLUE : color}
						d="M256 48h184c13.3 0 24 10.7 24 24v184H256V48zM48 256h208v208H72c-13.3 0-24-10.7-24-24V256z"
					/>
					<rect
						x="48"
						y="48"
						width="416"
						height="416"
						rx="24"
						stroke={checkerboard ? BLUE : color}
						strokeWidth="32"
					/>
					<path
						d="M256 48v416M48 256h416"
						stroke={checkerboard ? BLUE : color}
						strokeWidth="32"
					/>
				</svg>
			)}
		</ControlButton>
	);
};
