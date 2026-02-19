import React, {useCallback} from 'react';
import {InputDragger} from '../../NewComposition/InputDragger';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {useLocalState} from './local-state';
import type {AnyZodSchema} from './zod-schema-type';
import {getZodDef, isZodV3Schema} from './zod-schema-type';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const getMinValue = (schema: AnyZodSchema) => {
	const {checks} = getZodDef(schema);
	if (!checks) return -Infinity;

	if (isZodV3Schema(schema)) {
		// v3: {kind: "min", value: 0, inclusive: true}
		const minCheck = checks.find((c: {kind: string}) => c.kind === 'min');
		if (!minCheck || !minCheck.inclusive) return -Infinity;
		return minCheck.value;
	}

	// v4: check objects with _zod.def = {check: "greater_than", value: 0, inclusive: true}
	for (const c of checks) {
		const def = c._zod?.def;
		if (def?.check === 'greater_than' && def.inclusive) {
			return def.value;
		}
	}

	return -Infinity;
};

const getMaxValue = (schema: AnyZodSchema) => {
	const {checks} = getZodDef(schema);
	if (!checks) return Infinity;

	if (isZodV3Schema(schema)) {
		// v3: {kind: "max", value: 100, inclusive: true}
		const maxCheck = checks.find((c: {kind: string}) => c.kind === 'max');
		if (!maxCheck || !maxCheck.inclusive) return Infinity;
		return maxCheck.value;
	}

	// v4: check objects with _zod.def = {check: "less_than", value: 100, inclusive: true}
	for (const c of checks) {
		const def = c._zod?.def;
		if (def?.check === 'less_than' && def.inclusive) {
			return def.value;
		}
	}

	return Infinity;
};

const getStep = (schema: AnyZodSchema): number | undefined => {
	const {checks} = getZodDef(schema);
	if (!checks) return undefined;

	if (isZodV3Schema(schema)) {
		// v3: {kind: "multipleOf", value: 5}
		const multipleStep = checks.find(
			(c: {kind: string}) => c.kind === 'multipleOf',
		);
		if (!multipleStep) return undefined;
		return multipleStep.value;
	}

	// v4: check objects with _zod.def = {check: "multiple_of", value: 5}
	for (const c of checks) {
		const def = c._zod?.def;
		if (def?.check === 'multiple_of') {
			return def.value;
		}
	}

	return undefined;
};

export const ZodNumberEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: number;
	readonly setValue: UpdaterFunction<number>;
	readonly defaultValue: number;
	readonly onSave: UpdaterFunction<number>;
	readonly onRemove: null | (() => void);
	readonly showSaveButton: boolean;
	readonly saving: boolean;
	readonly saveDisabledByParent: boolean;
	readonly mayPad: boolean;
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
		unsavedValue: value,
		schema,
		setValue,
		savedValue: defaultValue,
	});

	const onNumberChange = useCallback(
		(newValue: number) => {
			setLocalValue(() => newValue, false, false);
		},
		[setLocalValue],
	);

	const isDefault = localValue.value === defaultValue;

	const onTextChange = useCallback(
		(newValue: string) => {
			setLocalValue(() => Number(newValue), false, false);
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
