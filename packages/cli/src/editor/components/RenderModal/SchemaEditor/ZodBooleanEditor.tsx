import React, {useCallback} from 'react';
import {Checkbox} from '../../Checkbox';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodBooleanEditor: React.FC<{
	jsonPath: JSONPath;
	value: boolean;
	setValue: UpdaterFunction<boolean>;
	compact: boolean;
	defaultValue: boolean;
	onSave: UpdaterFunction<boolean>;
	onRemove: null | (() => void);
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
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
	saveDisabledByParent,
	mayPad,
}) => {
	const onValueChange = useCallback(
		(newValue: boolean, forceApply: boolean) => {
			setValue(() => newValue, forceApply);
		},
		[setValue]
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			onValueChange(e.target.checked, false);
		},
		[onValueChange]
	);

	const reset = useCallback(() => {
		onValueChange(defaultValue, true);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success>
			<SchemaLabel
				isDefaultValue={value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				compact={compact}
				onRemove={onRemove}
				saving={saving}
				valid
				saveDisabledByParent={saveDisabledByParent}
			/>
			<div style={fullWidth}>
				<Checkbox
					name={jsonPath.join('.')}
					checked={value}
					onChange={onChange}
					disabled={false}
				/>
			</div>
		</Fieldset>
	);
};
