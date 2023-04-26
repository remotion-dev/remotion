import type {PropsWithChildren} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {CLEAR_HOVER, LIGHT_TEXT} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

export const InlineAction: React.FC<
	PropsWithChildren<{
		onClick: React.MouseEventHandler<HTMLButtonElement>;
		disabled?: boolean;
	}>
> = ({children, onClick, disabled}) => {
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
			background: hovered ? CLEAR_HOVER : 'transparent',
			height: 24,
			width: 24,
			display: 'inline-flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 3,
			// TODO: Color does not get propagated to the children
			color: hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered]);

	return (
		<button
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
			disabled={disabled}
		>
			{children}
		</button>
	);
};
