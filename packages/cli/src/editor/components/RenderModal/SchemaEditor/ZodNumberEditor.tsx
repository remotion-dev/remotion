import React, {useCallback} from 'react';
import type {z} from 'zod';
import {InputDragger} from '../../NewComposition/InputDragger';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {ZodFieldValidation} from './ZodFieldValidation';

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
	setValue: UpdaterFunction<number>;
	defaultValue: number;
	onSave: UpdaterFunction<number>;
	onRemove: null | (() => void);
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	jsonPath,
	value,
	schema,
	setValue,
	onSave,
	defaultValue,
	onRemove,
	showSaveButton,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const {
		localValue,
		onChange: setLocalValue,

		reset,
	} = useLocalState({
		value,
		schema,
		setValue,
		defaultValue,
	});

	const onNumberChange = useCallback(
		(newValue: number) => {
			setLocalValue(() => newValue, false, false);
		},
		[setLocalValue]
	);

	const isDefault = localValue.value === defaultValue;

	const onTextChange = useCallback(
		(newValue: string) => {
			setLocalValue(() => Number(newValue), false, false);
		},
		[setLocalValue]
	);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				isDefaultValue={isDefault}
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
				<InputDragger
					type={'number'}
					value={localValue.value}
					style={fullWidth}
					status={localValue.zodValidation.success ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					onTextChange={onTextChange}
					onValueChange={onNumberChange}
					min={getMinValue(schema)}
					max={getMaxValue(schema)}
					step={getStep(schema)}
					rightAlign={false}
				/>
				<ZodFieldValidation path={jsonPath} localValue={localValue} />
			</div>
		</Fieldset>
	);
};
