import React from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';

const size = 24;

const background: React.CSSProperties = {
	height: size,
	width: size,
	position: 'relative',
};

const input: React.CSSProperties = {
	appearance: 'none',
	background: INPUT_BACKGROUND,
	border: '1px solid ' + INPUT_BORDER_COLOR_UNHOVERED,
	height: size,
	width: size,
	top: 0,
	left: 0,
	position: 'absolute',
	margin: 0,
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
};

export const Checkbox: React.FC<{
	checked: boolean;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({checked, onChange}) => {
	return (
		<div style={background}>
			<input
				style={input}
				type={'checkbox'}
				checked={checked}
				onChange={onChange}
			/>
			<div style={box}>{checked ? <Checkmark /> : null}</div>
		</div>
	);
};
