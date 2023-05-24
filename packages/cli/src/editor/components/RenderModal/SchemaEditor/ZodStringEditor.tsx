import React, {useCallback, useState} from 'react';
import type {z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';

type LocalState = {
	value: string;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodStringEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: string;
	defaultValue: string;
	setValue: UpdaterFunction<string>;
	onSave: (updater: (oldNum: unknown) => string) => void;
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

	console.log(defaultValue === value);
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value,
			zodValidation: schema.safeParse(value),
		};
	});

	const onValueChange = useCallback(
		(newValue: string, forceApply: boolean) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success || forceApply) {
				setValue(() => newValue);
			}
		},
		[schema, setValue]
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			onValueChange(e.target.value, false);
		},
		[onValueChange]
	);
	const reset = useCallback(() => {
		onValueChange(defaultValue, true);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	return (
		<div style={compact ? narrowOption : optionRow}>
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
		</div>
	);
};
