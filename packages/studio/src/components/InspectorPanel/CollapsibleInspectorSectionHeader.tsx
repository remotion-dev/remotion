import React from 'react';
import {TRANSPARENT, WHITE_ALPHA_40} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	HOVER_GROUP_CLASS_NAME,
	HOVER_GROUP_REVEAL_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {DisclosureChevron} from '../../icons/disclosure-chevron';
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
	color: WHITE_ALPHA_40,
};

const collapsibleSectionHeaderButton: React.CSSProperties = {
	...sectionTitle,
	alignItems: 'center',
	appearance: 'none',
	backgroundColor: TRANSPARENT,
	border: 'none',
	borderRadius: 3,
	cursor: 'default',
	display: 'flex',
	gap: 6,
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: WHITE_ALPHA_40,
		hoverColor: WHITE_ALPHA_40,
	}),
};

const sectionTitleLabel: React.CSSProperties = {
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	fontWeight: 'bold',
	lineHeight: '16px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const sectionChevronContainer: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'center',
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
					className={`__remotion-inspector-section-title ${HOVERABLE_CLASS_NAME} ${HOVER_GROUP_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
					onClick={onToggle}
					onKeyDown={stopActivationKeyPropagation}
					onKeyUp={stopActivationKeyPropagation}
					style={collapsibleSectionHeaderButton}
				>
					<span style={sectionTitleLabel}>{label}</span>
					<span
						aria-hidden="true"
						className={expanded ? HOVER_GROUP_REVEAL_CLASS_NAME : undefined}
						style={sectionChevronContainer}
					>
						<DisclosureChevron expanded={expanded} />
					</span>
				</button>
			)}
			{action}
		</div>
	);
};
