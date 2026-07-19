import type React from 'react';
import {
	BACKGROUND,
	BLUE,
	LIGHT_TEXT,
	LINE_COLOR,
	WHITE,
} from '../../helpers/colors';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';

export const container: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	color: WHITE,
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	height: '100%',
	minHeight: 0,
};

export const scrollableContainer: React.CSSProperties = {
	...container,
	overflowY: 'auto',
};

export const defaultPropsSection: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const visualControlsSection: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const compositionSection: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const inspectorSectionDivider: React.CSSProperties = {
	borderBottom: `1px solid ${LINE_COLOR}`,
};

export const sequenceHeaderDivider: React.CSSProperties = {
	backgroundColor: LINE_COLOR,
	flexShrink: 0,
	height: 1,
	margin: '4px 0',
};

export const sectionHeader: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	fontWeight: 'bold',
	padding: `8px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
	userSelect: 'none',
};

export const sequenceHeader: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	flexDirection: 'column',
	minWidth: 0,
	padding: `6px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 4px`,
};

export const sequenceHeaderTitle: React.CSSProperties = {
	alignSelf: 'stretch',
	backgroundColor: BACKGROUND,
	border: 'none',
	color: WHITE,
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	margin: 0,
	maxWidth: '100%',
	minWidth: 0,
	overflow: 'hidden',
	padding: 0,
	textAlign: 'left',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const sequenceHeaderSubtitle: React.CSSProperties = {
	alignSelf: 'flex-start',
	backgroundColor: BACKGROUND,
	border: 'none',
	color: LIGHT_TEXT,
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	margin: 0,
	maxWidth: '100%',
	minWidth: 0,
	overflow: 'hidden',
	padding: 0,
	textAlign: 'left',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const sectionHeaderRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 8,
	justifyContent: 'space-between',
	minWidth: 0,
};

export const sectionHeaderTitle: React.CSSProperties = {
	color: LIGHT_TEXT,
	flexShrink: 0,
	fontSize: 12,
	fontWeight: 'bold',
	lineHeight: '16px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	whiteSpace: 'nowrap',
};

export const sectionHeaderStart: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 8,
	minWidth: 0,
};

export const sectionHeaderEnd: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
};

export const defaultPropsWarningContainer: React.CSSProperties = {
	alignItems: 'flex-start',
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 8px`,
};

export const defaultPropsWarningMessages: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
};

export const resolveLinkStyle: React.CSSProperties = {
	color: BLUE,
	fontFamily: 'sans-serif',
	fontSize: 12,
	textDecoration: 'underline',
	whiteSpace: 'nowrap',
};

export const selectedContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	flex: 1,
	minHeight: 0,
	overflowY: 'auto',
};

export const centeredMessage: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	display: 'flex',
	flex: 1,
	fontSize: 14,
	justifyContent: 'center',
	padding: 24,
	textAlign: 'center',
};

export const detailsContainer: React.CSSProperties = {
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

export const detailsWithInlineAction: React.CSSProperties = {
	paddingBottom: INSPECTOR_PANEL_HORIZONTAL_PADDING,
};

export const detailsBeforeInlineAction: React.CSSProperties = {
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

export const guideDetailsContainer: React.CSSProperties = {
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
};

export const detailRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 12,
	justifyContent: 'space-between',
};

export const detailLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
};

export const detailValue: React.CSSProperties = {
	color: WHITE,
	fontSize: 13,
	fontVariantNumeric: 'tabular-nums',
	minWidth: 0,
	textAlign: 'right',
	wordBreak: 'break-word',
};

export const keyframeEditorRow: React.CSSProperties = {
	alignItems: 'flex-start',
	display: 'flex',
	gap: 12,
	justifyContent: 'space-between',
	minWidth: 0,
	padding: '10px 0',
};

export const keyframeEditorLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: '22px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const keyframeEditorValue: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	justifyContent: 'flex-end',
	minHeight: 22,
	minWidth: 0,
};
