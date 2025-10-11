import React, {useMemo} from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';

const size = 20;

const background: React.CSSProperties = {
	height: size,
	width: size,
	position: 'relative',
};

const box: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	position: 'absolute',
	height: size,
	width: size,
	top: 0,
	left: 0,
	pointerEvents: 'none',
	color: 'white',
};

export const Checkbox: React.FC<{
	readonly checked: boolean;
	readonly onChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly name: string;
	readonly disabled?: boolean;
}> = ({checked, onChange, disabled, name}) => {
	const input: React.CSSProperties = useMemo(() => {
		return {
			appearance: 'none',
			background: disabled ? 'transparent' : INPUT_BACKGROUND,
			border: '1px solid ' + INPUT_BORDER_COLOR_UNHOVERED,
			height: size,
			width: size,
			top: 0,
			left: 0,
			position: 'absolute',
			margin: 0,
		};
	}, [disabled]);

	return (
		<div style={background}>
			<input
				style={input}
				type={'checkbox'}
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				name={name}
			/>
			<div style={box}>{checked ? <Checkmark /> : null}</div>
		</div>
	);
};
