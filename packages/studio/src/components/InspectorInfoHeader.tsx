import React from 'react';
import {BACKGROUND, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';

export const INSPECTOR_INFO_HEADER_MIN_HEIGHT = 84;

const containerBase: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	color: WHITE,
	display: 'block',
	padding: `6px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

const container: React.CSSProperties = {
	...containerBase,
	minHeight: INSPECTOR_INFO_HEADER_MIN_HEIGHT,
};

const row: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	flexDirection: 'row',
	lineHeight: '18px',
	minWidth: 0,
};

const content: React.CSSProperties = {
	minWidth: 0,
	width: '100%',
};

const title: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	color: WHITE,
	fontSize: 12,
	lineHeight: '18px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const subtitle: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	color: LIGHT_TEXT,
	fontSize: 12,
	lineHeight: '18px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const inspectorSubtitle: React.CSSProperties = {
	...subtitle,
	boxSizing: 'border-box',
	fontFamily: 'sans-serif',
	fontSize: 13,
	height: 28,
	lineHeight: '18px',
	margin: '0 4px',
	padding: '5px 8px',
	width: 'calc(100% - 8px)',
};

export const InspectorInfoHeader: React.FC<{
	readonly children?: React.ReactNode;
	readonly contentSized?: boolean;
	readonly minHeight?: number;
	readonly padding?: React.CSSProperties['padding'];
}> = ({children, contentSized = false, minHeight, padding}) => {
	const sizeStyle = contentSized
		? containerBase
		: minHeight === undefined
			? container
			: {...containerBase, minHeight};
	const style = padding === undefined ? sizeStyle : {...sizeStyle, padding};

	return (
		<div style={style}>
			{children === undefined || children === null ? null : (
				<div style={row}>
					<div style={content}>{children}</div>
				</div>
			)}
		</div>
	);
};

export const InspectorInfoTitle: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return <div style={title}>{children}</div>;
};

export const InspectorInfoSubtitle: React.FC<{
	readonly children: React.ReactNode;
	readonly size?: 'default' | 'inspector';
}> = ({children, size = 'default'}) => {
	return (
		<div style={size === 'inspector' ? inspectorSubtitle : subtitle}>
			{children}
		</div>
	);
};
