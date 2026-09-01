import React, {forwardRef, useMemo} from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';

const button: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	borderRadius: 6,
	cursor: 'default',
	fontFamily: 'inherit',
	fontSize: 14,
	flexDirection: 'row',
	margin: 0,
	padding: 0,
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
		const idleBackground = style?.backgroundColor ?? TRANSPARENT;
		const idleColor = style?.color ?? LIGHT_TEXT;

		return {
			...button,
			...hoverableStyle({
				idleBackground,
				hoverBackground:
					disabled || style?.backgroundColor
						? idleBackground
						: getBackgroundFromHoverState({hovered: true, selected: false}),
				idleColor,
				hoverColor: disabled || style?.color ? idleColor : WHITE,
			}),
			...(size === 'compact' ? {fontSize: 12} : null),
			...(size === 'condensed' ? {fontSize: 11} : null),
			...(style ?? {}),
		};
	}, [disabled, size, style]);
	const buttonContainer: React.CSSProperties = useMemo(() => {
		return {
			padding:
				size === 'condensed' ? '2px 7px' : size === 'compact' ? '5px 8px' : 10,
			cursor: 'default',
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
			className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
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
