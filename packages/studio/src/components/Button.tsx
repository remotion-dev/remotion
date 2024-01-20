import React, {forwardRef, useMemo} from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../helpers/colors';
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

const ButtonRefForwardFunction: React.ForwardRefRenderFunction<
	HTMLButtonElement,
	{
		onClick: () => void;
		disabled?: boolean;
		children: React.ReactNode;
		style?: React.CSSProperties;
		buttonContainerStyle?: React.CSSProperties;
		autoFocus?: boolean;
		title?: string;
		id?: string;
	}
> = (
	{
		children,
		onClick,
		title,
		disabled,
		style,
		id,
		autoFocus,
		buttonContainerStyle,
	},
	ref,
) => {
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
			...(buttonContainerStyle ?? {}),
		};
	}, [buttonContainerStyle, disabled]);

	return (
		<button
			ref={ref}
			id={id}
			style={combined}
			type="button"
			disabled={disabled}
			onClick={onClick}
			autoFocus={autoFocus}
			title={title}
		>
			<div className="css-reset" style={buttonContainer}>
				{children}
			</div>
		</button>
	);
};

export const Button = forwardRef(ButtonRefForwardFunction);
