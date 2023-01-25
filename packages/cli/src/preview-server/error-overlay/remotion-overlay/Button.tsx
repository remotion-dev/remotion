import React, {useMemo} from 'react';
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
	style?: React.CSSProperties;
}> = ({children, onClick, disabled, style}) => {
	const combined = useMemo(() => {
		return {
			...button,
			...(style ?? {}),
		};
	}, [style]);
	return (
		<button
			style={combined}
			type="button"
			disabled={disabled}
			onClick={onClick}
		>
			<div className="css-reset" style={buttonContainer}>
				{children}
			</div>
		</button>
	);
};
