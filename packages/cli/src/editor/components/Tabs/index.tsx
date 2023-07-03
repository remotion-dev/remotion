import React, {useCallback, useMemo, useState} from 'react';
import {
	BACKGROUND,
	BLUE,
	CLEAR_HOVER,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';

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
	paddingLeft: 16,
	display: 'flex',
	flexDirection: 'row',
	fontSize: 14,
	color: 'inherit',
	alignItems: 'center',
};

export const Tab: React.FC<{
	children: React.ReactNode;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	style?: React.CSSProperties;
	selected: boolean;
}> = ({children, onClick, style, selected}) => {
	const [hovered, setHovered] = useState(false);
	const {tabIndex} = useZIndex();

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const definiteStyle: React.CSSProperties = useMemo(
		() => ({
			...selectorButton,
			backgroundColor: selected
				? BACKGROUND
				: hovered
				? CLEAR_HOVER
				: INPUT_BACKGROUND,
			color: selected ? 'white' : LIGHT_TEXT,
			borderTop: selected ? '2px solid ' + BLUE : '2px solid transparent',
			boxShadow: selected ? 'none' : undefined,
			...style,
		}),
		[hovered, selected, style]
	);

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
