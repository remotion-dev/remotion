import React, {forwardRef, useMemo} from 'react';
import {INPUT_BACKGROUND, BLACK_ALPHA_60, WHITE} from '../helpers/colors';
const button: React.CSSProperties = {
	border: `1px solid ${BLACK_ALPHA_60}`,
	borderRadius: 4,
	backgroundColor: INPUT_BACKGROUND,
	appearance: 'none',
	fontFamily: 'inherit',
	fontSize: 14,
	color: WHITE,
	flexDirection: 'row',
};

export type ButtonProps = {
	readonly onClick: () => void;
	readonly disabled?: boolean;
	readonly children: React.ReactNode;
	readonly size?: 'default' | 'compact' | 'condensed';
	readonly style?: React.CSSProperties;
	readonly buttonContainerStyle?: React.CSSProperties;
	readonly autoFocus?: boolean;
	readonly title?: string;
	readonly id?: string;
	readonly onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
};

const ButtonRefForwardFunction: React.ForwardRefRenderFunction<
	HTMLButtonElement,
	ButtonProps
> = (
	{
		children,
		onClick,
		title,
		disabled,
		size = 'default',
		style,
		id,
		autoFocus,
		buttonContainerStyle,
		onPointerDown,
	},
	ref,
) => {
	const combined = useMemo(() => {
		return {
			...button,
			...(size === 'compact' ? {fontSize: 12} : null),
			...(size === 'condensed' ? {fontSize: 11} : null),
			...(style ?? {}),
		};
	}, [size, style]);
	const buttonContainer: React.CSSProperties = useMemo(() => {
		return {
			padding:
				size === 'condensed' ? '2px 7px' : size === 'compact' ? '5px 8px' : 10,
			cursor: disabled ? 'inherit' : 'pointer',
			fontSize: size === 'condensed' ? 11 : size === 'compact' ? 12 : 14,
			lineHeight:
				size === 'condensed' ? '14px' : size === 'compact' ? '14px' : undefined,
			opacity: disabled ? 0.7 : 1,
			...(buttonContainerStyle ?? {}),
		};
	}, [buttonContainerStyle, disabled, size]);

	return (
		<button
			ref={ref}
			id={id}
			style={combined}
			type="button"
			disabled={disabled}
			onClick={onClick}
			onPointerDown={onPointerDown}
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
