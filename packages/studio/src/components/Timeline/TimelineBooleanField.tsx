import React, {useCallback} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {Checkbox} from '../Checkbox';

const checkboxContainer: React.CSSProperties = {
	marginLeft: 8,
};

export const TimelineBooleanField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly codeValue: unknown;
	readonly canUpdate: boolean;
	readonly onSave: (key: string, value: unknown) => Promise<void>;
}> = ({field, codeValue, canUpdate, onSave}) => {
	const checked = Boolean(codeValue);

	const onChange = useCallback(() => {
		if (canUpdate) {
			onSave(field.key, !checked);
		}
	}, [canUpdate, onSave, field.key, checked]);

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
