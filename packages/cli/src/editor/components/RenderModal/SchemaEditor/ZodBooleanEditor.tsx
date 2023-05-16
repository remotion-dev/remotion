import React, {useCallback} from 'react';
import {Checkbox} from '../../Checkbox';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodBooleanEditor: React.FC<{
	jsonPath: JSONPath;
	value: boolean;
	setValue: UpdaterFunction<boolean>;
	compact: boolean;
	defaultValue: boolean;
	onSave: (updater: (oldNum: unknown) => boolean) => void;
	onRemove: null | (() => void);
	showSaveButton: boolean;
	saving: boolean;
}> = ({
	jsonPath,
	value,
	setValue,
	onSave,
	compact,
	defaultValue,
	onRemove,
	showSaveButton,
	saving,
}) => {
	const onValueChange = useCallback(
		(newValue: boolean) => {
			setValue(() => newValue);
		},
		[setValue]
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			onValueChange(e.target.checked);
		},
		[onValueChange]
	);

	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	return (
		<div style={compact ? narrowOption : optionRow}>
			<SchemaLabel
				isDefaultValue={value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				compact={compact}
				onRemove={onRemove}
				saving={saving}
			/>
			<div style={fullWidth}>
				<Checkbox checked={value} onChange={onChange} disabled={false} />
			</div>
		</div>
	);
};
