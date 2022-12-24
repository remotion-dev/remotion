import type {PropsWithChildren} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {CLEAR_HOVER} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

export const InlineAction: React.FC<
	PropsWithChildren<{
		onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
	}>
> = ({children, onClick}) => {
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
			opacity: hovered ? 1 : 0.6,
		};
	}, [hovered]);

	return (
		<button
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
		>
			{children}
		</button>
	);
};
