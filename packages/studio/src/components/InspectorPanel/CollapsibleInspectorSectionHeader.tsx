import React from 'react';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {sectionHeaderRow} from './styles';

const sectionTitle: React.CSSProperties = {
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
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

const staticSectionTitle: React.CSSProperties = {
	...sectionTitle,
	color: LIGHT_TEXT,
};

const collapsibleSectionHeaderButton: React.CSSProperties = {
	...sectionTitle,
	appearance: 'none',
	backgroundColor: TRANSPARENT,
	border: 'none',
	borderRadius: 3,
	cursor: 'default',
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
};

const stopActivationKeyPropagation = (
	event: React.KeyboardEvent<HTMLButtonElement>,
) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.stopPropagation();
	}
};

export const CollapsibleInspectorSectionHeader: React.FC<{
	readonly action: React.ReactNode;
	readonly expanded: boolean;
	readonly label: string;
	readonly onToggle: (() => void) | null;
}> = ({action, expanded, label, onToggle}) => {
	return (
		<div style={sectionHeaderRow}>
			{onToggle === null ? (
				<div style={staticSectionTitle}>{label}</div>
			) : (
				<button
					type="button"
					aria-expanded={expanded}
					aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
					className={`__remotion-inspector-section-title ${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
					onClick={onToggle}
					onKeyDown={stopActivationKeyPropagation}
					onKeyUp={stopActivationKeyPropagation}
					style={collapsibleSectionHeaderButton}
				>
					{label}
				</button>
			)}
			{action}
		</div>
	);
};
