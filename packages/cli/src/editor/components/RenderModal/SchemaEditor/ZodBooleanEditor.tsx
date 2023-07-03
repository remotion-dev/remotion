import React, {useCallback} from 'react';
import {Checkbox} from '../../Checkbox';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import type {z} from 'zod';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodBooleanEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: boolean;
	setValue: UpdaterFunction<boolean>;
	defaultValue: boolean;
	onSave: UpdaterFunction<boolean>;
	onRemove: null | (() => void);
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	value,
	setValue,
	onSave,
	defaultValue,
	onRemove,
	showSaveButton,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const {localValue, onChange, reset} = useLocalState({
		schema,
		setValue,
		value,
		defaultValue,
	});

	const onToggle: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			onChange(() => e.target.checked, false, false);
		},
		[onChange]
	);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				isDefaultValue={localValue.value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				valid
				saveDisabledByParent={saveDisabledByParent}
				suffix={null}
			/>
			<div style={fullWidth}>
				<Checkbox
					name={jsonPath.join('.')}
					checked={localValue.value}
					onChange={onToggle}
					disabled={false}
				/>
			</div>
		</Fieldset>
	);
};
