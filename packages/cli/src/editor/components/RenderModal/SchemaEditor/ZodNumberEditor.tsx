import React, {useCallback, useState} from 'react';
import type {z} from 'remotion';
import {Spacing} from '../../layout';
import {InputDragger} from '../../NewComposition/InputDragger';
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

const getMinValue = (schema: z.ZodTypeAny) => {
	const minCheck = (schema as z.ZodNumber)._def.checks.find(
		(c) => c.kind === 'min'
	);
	if (!minCheck) {
		return -Infinity;
	}

	if (minCheck.kind !== 'min') {
		throw new Error('Expected min check');
	}

	if (!minCheck.inclusive) {
		return -Infinity;
	}

	return minCheck.value;
};

const getMaxValue = (schema: z.ZodTypeAny) => {
	const maxCheck = (schema as z.ZodNumber)._def.checks.find(
		(c) => c.kind === 'max'
	);
	if (!maxCheck) {
		return Infinity;
	}

	if (maxCheck.kind !== 'max') {
		throw new Error('Expected max check');
	}

	if (!maxCheck.inclusive) {
		return Infinity;
	}

	return maxCheck.value;
};

const getStep = (schema: z.ZodTypeAny): number | undefined => {
	const multipleStep = (schema as z.ZodNumber)._def.checks.find(
		(c) => c.kind === 'multipleOf'
	);

	if (!multipleStep) {
		return undefined;
	}

	if (multipleStep.kind !== 'multipleOf') {
		throw new Error('Expected multipleOf check');
	}

	return multipleStep.value;
};

export const ZodNumberEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: number;
	setValue: React.Dispatch<React.SetStateAction<number>>;
	compact: boolean;
	defaultValue: number;
	onSave: (updater: (oldNum: unknown) => number) => void;
	onRemove: null | (() => void);
	showSaveButton: boolean;
}> = ({
	jsonPath,
	value,
	schema,
	setValue,
	onSave,
	compact,
	defaultValue,
	onRemove,
	showSaveButton,
}) => {
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value: String(value),
			zodValidation: schema.safeParse(value),
		};
	});

	const onChange = useCallback(
		(newValue: string) => {
			const safeParse = schema.safeParse(Number(newValue));
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(Number(newValue));
			}
		},
		[schema, setValue]
	);

	const onValueChange = useCallback(
		(newValue: number) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: String(newValue),
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newValue);
			}
		},
		[schema, setValue]
	);

	const isDefault = value === defaultValue;

	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	return (
		<div style={compact ? narrowOption : optionRow}>
			<SchemaLabel
				isDefaultValue={isDefault}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				compact={compact}
				onRemove={onRemove}
			/>
			<div style={fullWidth}>
				<InputDragger
					type={'number'}
					value={localValue.value}
					style={fullWidth}
					status={localValue.zodValidation.success ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					onTextChange={onChange}
					onValueChange={onValueChange}
					min={getMinValue(schema)}
					max={getMaxValue(schema)}
					step={getStep(schema)}
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
