import React, {useCallback, useMemo, useState} from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

export type RenderInlineAction = (color: string) => React.ReactNode;

export type InlineActionProps = {
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly disabled?: boolean;
	readonly renderAction: RenderInlineAction;
	readonly title?: string;
	readonly unhoveredColor?: string;
	readonly variant: 'compact' | null;
};

export const InlineAction = ({
	renderAction,
	onClick,
	disabled,
	title,
	unhoveredColor = LIGHT_TEXT,
	variant,
}: InlineActionProps) => {
	const {tabIndex} = useZIndex();

	const [hovered, setHovered] = useState(false);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: 'none',
			background: disabled
				? TRANSPARENT
				: getBackgroundFromHoverState({hovered, selected: false}),
			height: 24,
			width: variant === 'compact' ? 14 : 24,
			padding: 0,
			display: 'inline-flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 3,
			opacity: disabled ? 0.5 : 1,
			pointerEvents: disabled ? 'none' : 'auto',
		};
	}, [disabled, hovered, variant]);

	return (
		<button
			type="button"
			disabled={disabled}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
			title={title}
			aria-label={title}
		>
			{renderAction(hovered ? WHITE : unhoveredColor)}
		</button>
	);
};
