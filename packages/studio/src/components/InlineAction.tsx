import React, {useCallback, useMemo, useState} from 'react';
import {LIGHT_TEXT, getBackgroundFromHoverState} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

export type RenderInlineAction = (color: string) => React.ReactNode;

export type InlineActionProps = {
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly disabled?: boolean;
	readonly renderAction: RenderInlineAction;
	readonly title?: string;
};

export const InlineAction = ({
	renderAction,
	onClick,
	disabled,
	title,
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
				? 'transparent'
				: getBackgroundFromHoverState({hovered, selected: false}),
			height: 24,
			width: 24,
			display: 'inline-flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 3,
			pointerEvents: disabled ? 'none' : 'auto',
		};
	}, [disabled, hovered]);

	return (
		<button
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
			title={title}
		>
			{renderAction(hovered ? 'white' : LIGHT_TEXT)}
		</button>
	);
};
