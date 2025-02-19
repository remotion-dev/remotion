import React, {useCallback} from 'react';
import type {z} from 'zod';
import {RemotionInput} from '../../NewComposition/RemInput';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodStringEditor: React.FC<{
	readonly schema: z.ZodTypeAny;
	readonly jsonPath: JSONPath;
	readonly value: string;
	readonly defaultValue: string;
	readonly setValue: UpdaterFunction<string>;
	readonly onSave: UpdaterFunction<string>;
	readonly onRemove: null | (() => void);
	readonly showSaveButton: boolean;
	readonly saving: boolean;
	readonly saveDisabledByParent: boolean;
	readonly mayPad: boolean;
}> = ({
	jsonPath,
	value,
	setValue,
	showSaveButton,
	defaultValue,
	schema,
	onSave,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {
		localValue,
		onChange: setLocalValue,
		reset,
	} = useLocalState({
		schema,
		setValue,
		unsavedValue: value,
		savedValue: defaultValue,
	});

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setLocalValue(() => e.target.value, false, false);
		},
		[setLocalValue],
	);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={false}>
			<SchemaLabel
				handleClick={null}
				isDefaultValue={localValue.value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				valid={localValue.zodValidation.success}
				saveDisabledByParent={saveDisabledByParent}
				suffix={null}
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
				<ZodFieldValidation path={jsonPath} localValue={localValue} />
			</div>
		</Fieldset>
	);
};
