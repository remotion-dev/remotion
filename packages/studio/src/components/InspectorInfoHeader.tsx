import React from 'react';
import {BACKGROUND, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from './InspectorPanelLayout';

export const INSPECTOR_INFO_HEADER_MIN_HEIGHT = 84;

const container: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	color: WHITE,
	display: 'block',
	padding: `6px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
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

export const InspectorInfoHeader: React.FC<{
	readonly children?: React.ReactNode;
	readonly minHeight: number;
}> = ({children, minHeight}) => {
	return (
		<div style={{...container, minHeight}}>
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
}> = ({children}) => {
	return <div style={subtitle}>{children}</div>;
};
