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

export const Button: React.FC<{
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
	style?: React.CSSProperties;
	autoFocus?: boolean;
}> = ({children, onClick, disabled, style, autoFocus}) => {
	const combined = useMemo(() => {
		return {
			...button,
			...(style ?? {}),
		};
	}, [style]);

	const buttonContainer: React.CSSProperties = useMemo(() => {
		return {
			padding: 10,
			cursor: disabled ? 'inherit' : 'pointer',
			fontSize: 14,
			opacity: disabled ? 0.7 : 1,
		};
	}, [disabled]);

	return (
		<button
			style={combined}
			type="button"
			disabled={disabled}
			onClick={onClick}
			autoFocus={autoFocus}
		>
			<div className="css-reset" style={buttonContainer}>
				{children}
			</div>
		</button>
	);
};
