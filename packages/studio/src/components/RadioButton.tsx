import React from 'react';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';

const row: React.CSSProperties = {
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: getBackgroundFromHoverState({
			hovered: true,
			selected: false,
		}),
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	alignItems: 'center',
	appearance: 'none',
	border: 'none',
	borderRadius: 4,
	boxSizing: 'border-box',
	cursor: 'default',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 14,
	gap: 8,
	lineHeight: '20px',
	margin: '5px -8px',
	padding: '4px 8px',
	textAlign: 'left',
	userSelect: 'none',
	width: 'calc(100% + 16px)',
};

const circle: React.CSSProperties = {
	alignItems: 'center',
	border: `1px solid ${CURRENT_COLOR}`,
	borderRadius: '50%',
	boxSizing: 'border-box',
	display: 'flex',
	flexShrink: 0,
	height: 20,
	justifyContent: 'center',
	width: 20,
};

const bullet: React.CSSProperties = {
	backgroundColor: CURRENT_COLOR,
	borderRadius: '50%',
	height: 8,
	width: 8,
};

const label: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '20px',
};

export const RadioButton: React.FC<{
	readonly checked: boolean;
	readonly children: React.ReactNode;
	readonly onClick: () => void;
}> = ({checked, children, onClick}) => {
	return (
		<button
			aria-checked={checked}
			className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
			onClick={onClick}
			role="radio"
			style={row}
			type="button"
		>
			<span style={circle}>{checked ? <span style={bullet} /> : null}</span>
			<span style={label}>{children}</span>
		</button>
	);
};
