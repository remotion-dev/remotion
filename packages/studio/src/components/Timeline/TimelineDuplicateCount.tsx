import React from 'react';
import {WHITE_ALPHA_20, WHITE_ALPHA_60} from '../../helpers/colors';

const badgeStyle: React.CSSProperties = {
	alignItems: 'center',
	border: `1px solid ${WHITE_ALPHA_20}`,
	borderRadius: 4,
	boxSizing: 'border-box',
	color: WHITE_ALPHA_60,
	display: 'inline-flex',
	flexShrink: 0,
	fontSize: 10,
	fontWeight: 300,
	height: 14,
	justifyContent: 'center',
	lineHeight: '12px',
	minWidth: 18,
	padding: '0 3px',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

export const TimelineDuplicateCount: React.FC<{
	readonly count: number;
}> = ({count}) => {
	const label = `${count} other programmatically duplicated ${count === 1 ? 'instance is' : 'instances are'} hidden`;

	return (
		<span style={badgeStyle} title={label} aria-label={label}>
			+{count}
		</span>
	);
};
