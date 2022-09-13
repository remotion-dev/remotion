import React from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../helpers/colors';
import {Row} from './layout';

const container: React.CSSProperties = {
	padding: 10,
	cursor: 'pointer',
	fontSize: 14,
};

const button: React.CSSProperties = {
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	borderRadius: 4,
	backgroundColor: INPUT_BACKGROUND,
	appearance: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
	color: 'white',
};

export const Button: React.FC<
	React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> & {
		children: React.ReactNode;
	}
> = ({children, ...props}) => {
	return (
		<button {...props} style={button} type="button">
			<Row style={container}>{children}</Row>
		</button>
	);
};
