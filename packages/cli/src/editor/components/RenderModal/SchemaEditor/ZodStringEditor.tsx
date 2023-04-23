import React, {useCallback, useState} from 'react';
import type {z} from 'remotion';
import {Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';

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
	setValue: React.Dispatch<React.SetStateAction<string>>;
	onSave: (updater: (oldNum: unknown) => string) => void;
	onRemove: null | (() => void);
	compact: boolean;
	showSaveButton: boolean;
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
}) => {
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value,
			zodValidation: schema.safeParse(value),
		};
	});

	const onValueChange = useCallback(
		(newValue: string) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newValue);
			}
		},
		[schema, setValue]
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			onValueChange(e.target.value);
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
				compact={compact}
				isDefaultValue={value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
			<div style={fullWidth}>
				<RemotionInput
					value={localValue.value}
					status={localValue.zodValidation.success ? 'ok' : 'error'}
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
