import React, {useCallback, useMemo, useState} from 'react';
import {getBackgroundFromHoverState, LIGHT_TEXT} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

export type RenderInlineAction = (color: string) => React.ReactNode;

export const InlineAction: React.FC<{
	onClick: React.MouseEventHandler<HTMLAnchorElement>;
	disabled?: boolean;
	renderAction: RenderInlineAction;
}> = ({renderAction, onClick, disabled}) => {
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
		<a
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
		>
			{renderAction(hovered ? 'white' : LIGHT_TEXT)}
		</a>
	);
};
