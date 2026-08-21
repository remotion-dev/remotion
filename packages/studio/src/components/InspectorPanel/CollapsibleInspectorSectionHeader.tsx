import React, {useMemo, useState} from 'react';
import {LIGHT_TEXT, WHITE} from '../../helpers/colors';
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
};

export const CollapsibleInspectorSectionHeader: React.FC<{
	readonly action: React.ReactNode;
	readonly expanded: boolean;
	readonly label: string;
	readonly onToggle: () => void;
}> = ({action, expanded, label, onToggle}) => {
	const [hovered, setHovered] = useState(false);
	const style = useMemo<React.CSSProperties>(() => {
		return {
			...collapsibleSectionHeaderButton,
			color: hovered ? WHITE : LIGHT_TEXT,
		};
	}, [hovered]);

	return (
		<div style={sectionHeaderRow}>
			<button
				type="button"
				aria-expanded={expanded}
				aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
				className="__remotion-inspector-section-title"
				onClick={onToggle}
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				style={style}
			>
				{label}
			</button>
			{action}
		</div>
	);
};
