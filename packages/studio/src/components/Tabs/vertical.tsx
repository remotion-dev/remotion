import React, {useCallback, useMemo, useState} from 'react';
import {
	WHITE_ALPHA_06,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';

const selectorButton: React.CSSProperties = {
	border: 'none',
	flex: 1,
	padding: 8,
	paddingLeft: 16,
	display: 'flex',
	flexDirection: 'row',
	fontFamily: 'sans-serif',
	fontSize: 14,
	color: 'inherit',
	alignItems: 'center',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

export const VerticalTab: React.FC<{
	readonly children: React.ReactNode;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderIcon?: (color: string) => React.ReactNode;
	readonly style?: React.CSSProperties;
	readonly selected: boolean;
}> = ({children, onClick, renderIcon, style, selected}) => {
	const [hovered, setHovered] = useState(false);
	const {tabIndex} = useZIndex();

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const color = selected || hovered ? WHITE : LIGHT_TEXT;

	const definiteStyle: React.CSSProperties = useMemo(() => {
		return {
			...selectorButton,
			backgroundColor: selected || hovered ? WHITE_ALPHA_06 : TRANSPARENT,
			color,
			boxShadow: 'none',
			...style,
		};
	}, [color, hovered, selected, style]);

	return (
		<button
			style={definiteStyle}
			type="button"
			onClick={onClick}
			tabIndex={tabIndex}
			onPointerLeave={onPointerLeave}
			onPointerEnter={onPointerEnter}
		>
			{renderIcon ? renderIcon(color) : null}
			{children}
		</button>
	);
};
