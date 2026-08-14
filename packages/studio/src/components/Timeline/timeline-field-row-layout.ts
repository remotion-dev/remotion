import type React from 'react';
import {
	EXPANDED_SECTION_PADDING_RIGHT,
	type SchemaFieldInfo,
} from '../../helpers/timeline-layout';
import {getTimelineFieldLabelFlexBasis} from './timeline-row-layout';

export const isTimelineFieldStacked = ({
	field,
	transform3DMode,
}: {
	readonly field: SchemaFieldInfo;
	readonly transform3DMode: boolean;
}) => {
	return (
		field.typeName === 'text-content' ||
		(transform3DMode &&
			(field.typeName === 'translate' ||
				field.typeName === 'rotation-css' ||
				field.typeName === 'scale' ||
				field.typeName === 'transform-origin'))
	);
};

export const getTimelineFieldLabelRowStyle = (
	depth: number,
	basePadding?: number,
): React.CSSProperties => {
	return {
		flex: `0 0 ${getTimelineFieldLabelFlexBasis(depth, basePadding)}`,
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

export const timelineCompactStackedFieldValueColumnStyle: React.CSSProperties =
	{
		...timelineFieldValueColumnStyle,
		marginBottom: -3,
		position: 'relative',
		top: -3,
	};

export const timelineStackedFieldContentStyle: React.CSSProperties = {
	alignSelf: 'stretch',
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};
