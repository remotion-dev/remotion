import React from 'react';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../../helpers/hoverable';
import {sectionHeaderRow} from './styles';

const collapsibleSectionHeaderButton: React.CSSProperties = {
	appearance: 'none',
	backgroundColor: 'transparent',
	border: 'none',
	borderRadius: 3,
	cursor: 'default',
	display: 'block',
	flex: 1,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	fontWeight: 'bold',
	lineHeight: '16px',
	margin: 0,
	minWidth: 0,
	overflow: 'hidden',
	padding: '4px 0',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	whiteSpace: 'nowrap',
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
};

export const CollapsibleInspectorSectionHeader: React.FC<{
	readonly action: React.ReactNode;
	readonly expanded: boolean;
	readonly label: string;
	readonly onToggle: () => void;
}> = ({action, expanded, label, onToggle}) => {
	return (
		<div style={sectionHeaderRow}>
			<button
				type="button"
				aria-expanded={expanded}
				aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
				className={`__remotion-inspector-section-title ${HOVERABLE_CLASS_NAME}`}
				onClick={onToggle}
				style={collapsibleSectionHeaderButton}
			>
				{label}
			</button>
			{action}
		</div>
	);
};
