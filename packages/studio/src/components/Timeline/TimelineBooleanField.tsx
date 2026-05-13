import React, {useCallback} from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {Checkbox} from '../Checkbox';

const checkboxContainer: React.CSSProperties = {
	marginLeft: 8,
};

export const TimelineBooleanField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly effectiveValue: unknown;
	readonly onSave: (value: unknown) => Promise<void>;
}> = ({field, propStatus, effectiveValue, onSave}) => {
	const checked = Boolean(effectiveValue);

	const onChange = useCallback(() => {
		const newValue = !checked;
		if (propStatus.canUpdate && newValue !== propStatus.codeValue) {
			onSave(newValue);
		}
	}, [propStatus, onSave, checked]);

	return (
		<div style={checkboxContainer}>
			<Checkbox
				checked={checked}
				onChange={onChange}
				name={field.key}
				disabled={!propStatus.canUpdate}
				variant="small"
			/>
		</div>
	);
};
