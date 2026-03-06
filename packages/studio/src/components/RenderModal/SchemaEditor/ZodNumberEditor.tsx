import React, {useCallback} from 'react';
import {InputDragger} from '../../NewComposition/InputDragger';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import {
	getZodNumberMaximum,
	getZodNumberMinimum,
	getZodNumberStep,
} from './zod-number-constraints';
import type {AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodNumberEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: number;
	readonly setValue: UpdaterFunction<number>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({jsonPath, value, schema, setValue, onRemove, mayPad}) => {
	const {localValue, onChange: setLocalValue} = useLocalState({
		value,
		schema,
		setValue,
	});

	const onNumberChange = useCallback(
		(newValue: number) => {
			setLocalValue(() => newValue, false, false);
		},
		[setLocalValue],
	);

	const onTextChange = useCallback(
		(newValue: string) => {
			setLocalValue(() => Number(newValue), false, false);
		},
		[setLocalValue],
	);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid={localValue.zodValidation.success}
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
					min={getZodNumberMinimum(schema)}
					max={getZodNumberMaximum(schema)}
					step={getZodNumberStep(schema)}
					rightAlign={false}
				/>
				<ZodFieldValidation path={jsonPath} localValue={localValue} />
			</div>
		</Fieldset>
	);
};
