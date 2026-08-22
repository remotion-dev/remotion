import React, {useCallback} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import type {
	SchemaFieldInfo,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {Checkbox} from '../Checkbox';

export const TimelineBooleanField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
}> = ({field, propStatus, effectiveValue, onSave}) => {
	const checked = Boolean(effectiveValue);

	const onChange = useCallback(() => {
		const newValue = !checked;
		if (newValue !== propStatus.codeValue) {
			onSave(newValue);
		}
	}, [propStatus, onSave, checked]);

	return (
		<Checkbox
			checked={checked}
			onChange={onChange}
			name={field.key}
			disabled={false}
			variant="small"
		/>
	);
};
