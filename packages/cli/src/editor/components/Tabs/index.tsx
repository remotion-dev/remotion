import React, {useCallback, useMemo, useState} from 'react';
import {
	CLEAR_HOVER,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../../helpers/colors';

const tabsContainer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

export const Tabs: React.FC<{
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({children, style}) => {
	const definiteStyle: React.CSSProperties = useMemo(() => {
		return {
			...tabsContainer,
			...style,
		};
	}, [style]);

	return <div style={definiteStyle}>{children}</div>;
};

const selectorButton: React.CSSProperties = {
	border: 'none',
	flex: 1,
	padding: 8,
	fontSize: 13,
};

export const Tab: React.FC<{
	children: React.ReactNode;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	style?: React.CSSProperties;
	selected: boolean;
}> = ({children, onClick, style, selected}) => {
	const [hovered, setHovered] = useState(false);

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
			...style,
		};
	}, [hovered, selected, style]);

	return (
		<button
			style={definiteStyle}
			type="button"
			onClick={onClick}
			onPointerLeave={onPointerLeave}
			onPointerEnter={onPointerEnter}
		>
			{children}
		</button>
	);
};
