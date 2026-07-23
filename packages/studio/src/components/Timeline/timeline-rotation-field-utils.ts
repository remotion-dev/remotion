import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import {serializeCssRotation} from './timeline-rotation-utils';

export const formatTimelineRotationFieldValue = ({
	decimalPlaces,
	fieldSchema,
	value,
}: {
	readonly decimalPlaces: number;
	readonly fieldSchema: SchemaFieldInfo['fieldSchema'];
	readonly value: number | string;
}) => {
	return formatTimelineFieldValueForDisplay({
		fieldSchema,
		value:
			fieldSchema.type === 'rotation-css' &&
			typeof value === 'number' &&
			Number.isFinite(value)
				? serializeCssRotation(value, decimalPlaces)
				: value,
	});
};
