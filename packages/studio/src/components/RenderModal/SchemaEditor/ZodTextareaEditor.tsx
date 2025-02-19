import React, {useCallback} from 'react';
import type {z} from 'zod';
import {RemTextarea} from '../../NewComposition/RemTextarea';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const textareaStyle: React.CSSProperties = {
	resize: 'vertical',
	minHeight: 100,
};

export const ZodTextareaEditor: React.FC<{
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

	const zodTypes = useZodTypesIfPossible();
	if (!zodTypes) {
		throw new Error('expected zod textarea');
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

	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
		(e) => {
			setLocalValue(() => e.target.value, false, false);
		},
		[setLocalValue],
	);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
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
				<RemTextarea
					onChange={onChange}
					value={localValue.value}
					status={localValue.zodValidation ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					name={jsonPath.join('.')}
					style={textareaStyle}
				/>
				<ZodFieldValidation path={jsonPath} localValue={localValue} />
			</div>
		</Fieldset>
	);
};
