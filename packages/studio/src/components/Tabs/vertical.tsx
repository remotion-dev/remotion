import React, {useMemo} from 'react';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
} from '../../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../../helpers/hoverable';
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
	const {tabIndex} = useZIndex();
	const isCompact = useBreakpoint(compactTabBreakpoint);

	const color = selected ? WHITE : LIGHT_TEXT;

	const definiteStyle: React.CSSProperties = useMemo(() => {
		return {
			...selectorButton,
			...hoverableStyle({
				idleBackground: selected ? WHITE_ALPHA_06 : TRANSPARENT,
				hoverBackground: WHITE_ALPHA_06,
				idleColor: color,
				hoverColor: WHITE,
			}),
			boxShadow: 'none',
			...style,
			...(isCompact ? compactSelectorButton : null),
		};
	}, [color, isCompact, selected, style]);

	const button = (
		<button
			aria-label={children}
			autoFocus={autoFocus}
			className={HOVERABLE_CLASS_NAME}
			style={definiteStyle}
			type="button"
			onClick={onClick}
			tabIndex={tabIndex}
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
