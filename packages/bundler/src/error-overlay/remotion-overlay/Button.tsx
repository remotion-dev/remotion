import React from 'react';

const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
const INPUT_BACKGROUND = '#2f363d';

const button: React.CSSProperties = {
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	borderRadius: 4,
	backgroundColor: INPUT_BACKGROUND,
	appearance: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
	color: 'white',
};

const buttonContainer: React.CSSProperties = {
	padding: 10,
	cursor: 'pointer',
	fontSize: 14,
};

export const Button: React.FC<{
	onClick: () => void;
}> = ({children, onClick}) => {
	return (
		<button style={button} type="button" onClick={onClick}>
			<div style={buttonContainer}>{children}</div>
		</button>
	);
};
