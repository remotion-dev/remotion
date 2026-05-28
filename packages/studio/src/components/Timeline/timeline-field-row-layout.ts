import type React from 'react';
import {getTimelineFieldLabelFlexBasis} from './timeline-row-layout';

export const getTimelineFieldLabelRowStyle = (
	depth: number,
): React.CSSProperties => {
	return {
		flex: `0 0 ${getTimelineFieldLabelFlexBasis(depth)}`,
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'row',
		gap: 6,
		minWidth: 0,
		overflow: 'hidden',
	};
};
