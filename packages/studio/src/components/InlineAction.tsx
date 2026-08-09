import React, {useMemo} from 'react';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../helpers/hoverable';
import {useZIndex} from '../state/z-index';

export type RenderInlineAction = (color: string) => React.ReactNode;

export type InlineActionProps = Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	'children' | 'onClick' | 'style'
> & {
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderAction: RenderInlineAction;
	readonly unhoveredColor?: string;
	readonly variant: 'compact' | null;
	readonly style?: React.CSSProperties;
};

export const InlineAction = ({
	renderAction,
	onClick,
	disabled,
	title,
	unhoveredColor = LIGHT_TEXT,
	variant,
	style: customStyle,
	className,
	...buttonProps
}: InlineActionProps) => {
	const {tabIndex} = useZIndex();

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: 'none',
			height: 24,
			width: variant === 'compact' ? 14 : 24,
			padding: 0,
			display: 'inline-flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 3,
			opacity: disabled ? 0.5 : 1,
			pointerEvents: disabled ? 'none' : 'auto',
			...hoverableStyle({
				idleBackground: TRANSPARENT,
				hoverBackground: disabled
					? TRANSPARENT
					: getBackgroundFromHoverState({hovered: true, selected: false}),
				idleColor: unhoveredColor,
				hoverColor: disabled ? unhoveredColor : WHITE,
			}),
			...customStyle,
		};
	}, [customStyle, disabled, unhoveredColor, variant]);

	return (
		<button
			{...buttonProps}
			type="button"
			className={
				className
					? `${HOVERABLE_CLASS_NAME} ${className}`
					: HOVERABLE_CLASS_NAME
			}
			disabled={disabled}
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
			title={title}
			aria-label={buttonProps['aria-label'] ?? title}
		>
			{renderAction(CURRENT_COLOR)}
		</button>
	);
};
