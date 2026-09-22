import React, {useCallback, useMemo, useState} from 'react';
import {
	WHITE_ALPHA_06,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../../helpers/colors';
import {useBreakpoint} from '../../helpers/use-breakpoint';
import {useZIndex} from '../../state/z-index';
import {ActionTooltip} from '../ActionTooltip';

const compactTabBreakpoint = 700;

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

const compactSelectorButton: React.CSSProperties = {
	width: 42,
	paddingLeft: 12,
	paddingRight: 4,
};

export const VerticalTab: React.FC<{
	readonly children: string;
	readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
	readonly renderIcon?: (color: string) => React.ReactNode;
	readonly style?: React.CSSProperties;
	readonly selected: boolean;
	readonly autoFocus?: boolean;
}> = ({children, onClick, renderIcon, style, selected, autoFocus}) => {
	const [hovered, setHovered] = useState(false);
	const {tabIndex} = useZIndex();
	const isCompact = useBreakpoint(compactTabBreakpoint);

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
			...(isCompact ? compactSelectorButton : null),
		};
	}, [color, hovered, isCompact, selected, style]);

	const button = (
		<button
			aria-label={children}
			autoFocus={autoFocus}
			style={definiteStyle}
			type="button"
			onClick={onClick}
			tabIndex={tabIndex}
			onPointerLeave={onPointerLeave}
			onPointerEnter={onPointerEnter}
		>
			{renderIcon ? renderIcon(color) : null}
			{isCompact ? null : children}
		</button>
	);

	if (!isCompact) {
		return button;
	}

	return (
		<ActionTooltip
			label={children}
			shortcut={null}
			delay={800}
			dismissOnClick
			side="right"
		>
			{button}
		</ActionTooltip>
	);
};
