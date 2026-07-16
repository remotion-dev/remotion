import type React from 'react';
import {EXPANDED_SECTION_PADDING_RIGHT} from '../../helpers/timeline-layout';
import {getTimelineFieldLabelFlexBasis} from './timeline-row-layout';

export const getTimelineFieldLabelRowStyle = (
	depth: number,
): React.CSSProperties => {
	return {
		flex: `0 0 ${getTimelineFieldLabelFlexBasis(depth)}`,
		minWidth: 0,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	};
};

export const timelineFieldValueColumnStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flex: 1,
	minWidth: 0,
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

export const timelineStackedFieldContentStyle: React.CSSProperties = {
	alignSelf: 'stretch',
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};
