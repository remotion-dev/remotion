import React, {useCallback} from 'react';
import type {z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodStringEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: string;
	defaultValue: string;
	setValue: UpdaterFunction<string>;
	onSave: UpdaterFunction<string>;
	onRemove: null | (() => void);
	compact: boolean;
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
}> = ({
	jsonPath,
	value,
	setValue,
	showSaveButton,
	defaultValue,
	schema,
	compact,
	onSave,
	onRemove,
	saving,
	saveDisabledByParent,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {localValue, onChange: setLocalValue} = useLocalState({
		schema,
		setValue,
		value,
	});

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setLocalValue(() => e.target.value, false);
		},
		[setLocalValue]
	);
	const reset = useCallback(() => {
		setLocalValue(() => defaultValue, true);
	}, [defaultValue, setLocalValue]);

	const save = useCallback(() => {
		onSave(() => value, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad success={false}>
			<SchemaLabel
				compact={compact}
				isDefaultValue={localValue.value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				valid={localValue.zodValidation.success}
				saveDisabledByParent={saveDisabledByParent}
			/>
			<div style={fullWidth}>
				<RemotionInput
					value={localValue.value}
					status={localValue.zodValidation ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					onChange={onChange}
					rightAlign={false}
					name={jsonPath.join('.')}
				/>
				{!localValue.zodValidation.success && (
					<>
						<Spacing y={1} block />
						<ValidationMessage
							align="flex-start"
							message={localValue.zodValidation.error.format()._errors[0]}
							type="error"
						/>
					</>
				)}
			</div>
		</Fieldset>
	);
};
