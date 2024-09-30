import React, {type ButtonHTMLAttributes, type DetailedHTMLProps} from 'react';
import {BlueButton} from '../../../components/layout/Button';

const playerButtonStyle: React.CSSProperties = {
	width: '40px',
	height: '40px',
	padding: 0,
	background: 'var(--blue-underlay)',
	color: 'white',
};

export const PlayerButton: React.FC<
	DetailedHTMLProps<
		ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> & {
		children: React.ReactNode;
	}
> = ({children, ...props}) => {
	return (
		<BlueButton
			size="bg"
			fullWidth={false}
			loading={false}
			style={playerButtonStyle}
			{...props}
		>
			{children}
		</BlueButton>
	);
};
