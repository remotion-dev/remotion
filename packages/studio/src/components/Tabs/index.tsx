import React, {useCallback, useMemo, useState} from 'react';
import {
	BACKGROUND,
	BLUE,
	BORDER_TRANSPARENT_2PX,
	WHITE_ALPHA_06,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	WHITE,
} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';

const tabsContainer: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

export const Tabs: React.FC<{
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
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
	padding: 3,
	height: 34,
	paddingLeft: 12,
	display: 'flex',
	flexDirection: 'row',
	fontSize: 13,
	color: 'inherit',
	alignItems: 'center',
	cursor: 'default',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

export const Tab: React.FC<{
	readonly children: React.ReactNode;
	readonly onClick: React.MouseEventHandler<HTMLDivElement>;
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

	const definiteStyle: React.CSSProperties = useMemo(
		() => ({
			...selectorButton,
			backgroundColor: selected
				? BACKGROUND
				: hovered
					? WHITE_ALPHA_06
					: INPUT_BACKGROUND,
			color: selected ? WHITE : LIGHT_TEXT,
			borderTop: selected ? '2px solid ' + BLUE : BORDER_TRANSPARENT_2PX,
			boxShadow: selected ? 'none' : undefined,
			...style,
		}),
		[hovered, selected, style],
	);

	return (
		<div
			style={definiteStyle}
			role="button"
			onClick={onClick}
			tabIndex={tabIndex}
			onPointerLeave={onPointerLeave}
			onPointerEnter={onPointerEnter}
		>
			{children}
		</div>
	);
};
