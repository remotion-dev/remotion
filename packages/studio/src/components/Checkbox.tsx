import React, {useEffect, useMemo, useRef} from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
	LIGHT_TEXT,
} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';

const size = 20;

const background: React.CSSProperties = {
	height: size,
	width: size,
	position: 'relative',
};

const bullet: React.CSSProperties = {
	width: 10,
	height: 10,
	backgroundColor: LIGHT_TEXT,
	borderRadius: '50%',
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
	readonly rounded?: boolean;
	readonly disabled?: boolean;
}> = ({checked, onChange, disabled, name, rounded}) => {
	const ref = useRef<HTMLInputElement>(null);
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

	useEffect(() => {
		if (ref.current) {
			ref.current.style.setProperty(
				'border-radius',
				rounded ? '50%' : '0%',
				'important',
			);
		}
	}, [rounded]);

	return (
		<div style={background}>
			<input
				ref={ref}
				style={input}
				type={'checkbox'}
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				name={name}
			/>
			<div style={box}>
				{checked ? rounded ? <div style={bullet} /> : <Checkmark /> : null}
			</div>
		</div>
	);
};
