import React, {useCallback} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {Checkbox} from '../Checkbox';

const checkboxContainer: React.CSSProperties = {
	marginLeft: 8,
};

export const TimelineBooleanField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly effectiveValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
}> = ({field, codeValue, effectiveValue, canUpdate, onSave}) => {
	const checked = Boolean(effectiveValue);

	const onChange = useCallback(() => {
		const newValue = !checked;
		if (canUpdate && newValue !== codeValue) {
			onSave(field.key, newValue);
		}
	}, [canUpdate, onSave, field.key, checked, codeValue]);

	return (
		<div style={checkboxContainer}>
			<Checkbox
				checked={checked}
				onChange={onChange}
				name={field.key}
				disabled={!canUpdate}
			/>
		</div>
	);
};
