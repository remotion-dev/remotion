import React from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../../../editor/helpers/colors';

const button: React.CSSProperties = {
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	borderRadius: 4,
	backgroundColor: INPUT_BACKGROUND,
	appearance: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
	color: 'white',
	flexDirection: 'row',
};

const buttonContainer: React.CSSProperties = {
	padding: 10,
	cursor: 'pointer',
	fontSize: 14,
};

export const Button: React.FC<{
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
}> = ({children, onClick, disabled}) => {
	return (
		<button style={button} type="button" disabled={disabled} onClick={onClick}>
			<div style={buttonContainer}>{children}</div>
		</button>
	);
};
