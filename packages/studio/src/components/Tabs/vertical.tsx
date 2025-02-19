import React, {useCallback, useMemo, useState} from 'react';
import {
	CLEAR_HOVER,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';

const selectorButton: React.CSSProperties = {
	border: 'none',
	flex: 1,
	padding: 8,
	paddingLeft: 16,
	display: 'flex',
	flexDirection: 'row',
	fontSize: 14,
	color: 'inherit',
	alignItems: 'center',
};

export const VerticalTab: React.FC<{
	readonly children: React.ReactNode;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly style?: React.CSSProperties;
	readonly selected: boolean;
}> = ({children, onClick, style, selected}) => {
	const [hovered, setHovered] = useState(false);
	const {tabIndex} = useZIndex();

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const definiteStyle: React.CSSProperties = useMemo(() => {
		return {
			...selectorButton,
			backgroundColor: selected
				? SELECTED_BACKGROUND
				: hovered
					? CLEAR_HOVER
					: 'transparent',
			color: selected ? 'white' : LIGHT_TEXT,
			boxShadow: selected ? 'none' : undefined,
			...style,
		};
	}, [hovered, selected, style]);

	return (
		<button
			style={definiteStyle}
			type="button"
			onClick={onClick}
			tabIndex={tabIndex}
			onPointerLeave={onPointerLeave}
			onPointerEnter={onPointerEnter}
		>
			{children}
		</button>
	);
};
