import React, {useMemo} from 'react';
import {
	BACKGROUND,
	BLUE,
	BORDER_TRANSPARENT_2PX,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	WHITE,
	WHITE_ALPHA_06,
} from '../../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../../helpers/hoverable';
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
	paddingLeft: 10,
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
	readonly onDragEnter?: React.DragEventHandler<HTMLDivElement>;
	readonly onDragLeave?: React.DragEventHandler<HTMLDivElement>;
	readonly onClick: React.MouseEventHandler<HTMLDivElement>;
	readonly style?: React.CSSProperties;
	readonly selected: boolean;
}> = ({children, onClick, onDragEnter, onDragLeave, style, selected}) => {
	const {tabIndex} = useZIndex();

	const definiteStyle: React.CSSProperties = useMemo(
		() => ({
			...selectorButton,
			...hoverableStyle({
				idleBackground: selected ? BACKGROUND : INPUT_BACKGROUND,
				hoverBackground: selected ? BACKGROUND : WHITE_ALPHA_06,
				idleColor: selected ? WHITE : LIGHT_TEXT,
				hoverColor: selected ? WHITE : LIGHT_TEXT,
			}),
			borderTop: selected ? '2px solid ' + BLUE : BORDER_TRANSPARENT_2PX,
			boxShadow: selected ? 'none' : undefined,
			...style,
		}),
		[selected, style],
	);

	return (
		<div
			className={HOVERABLE_CLASS_NAME}
			style={definiteStyle}
			role="button"
			onClick={onClick}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			tabIndex={tabIndex}
		>
			{children}
		</div>
	);
};
