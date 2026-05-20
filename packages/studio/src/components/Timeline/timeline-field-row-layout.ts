import type React from 'react';
import {getTimelineFieldLabelFlexBasis} from './timeline-row-layout';

export const getTimelineFieldLabelRowStyle = (
	depth: number,
): React.CSSProperties => {
	return {
		flex: `0 0 ${getTimelineFieldLabelFlexBasis(depth)}`,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	};
};
