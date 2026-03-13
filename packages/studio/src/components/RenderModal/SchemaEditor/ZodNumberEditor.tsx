import {useMemo} from 'react';
import React, {useCallback} from 'react';
import {InputDragger} from '../../NewComposition/InputDragger';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {
	getZodNumberMaximum,
	getZodNumberMinimum,
	getZodNumberStep,
} from './zod-number-constraints';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
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
	const onNumberChange = useCallback(
		(newValue: number) => {
			setValue(() => newValue, {shouldSave: false});
		},
		[setValue],
	);

	const onNumberChangeEnd = useCallback(
		(newValue: number) => {
			setValue(() => newValue, {shouldSave: true});
		},
		[setValue],
	);

	const onTextChange = useCallback(
		(newValue: string) => {
			setValue(() => Number(newValue), {shouldSave: true});
		},
		[setValue],
	);

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	return (
		<Fieldset shouldPad={mayPad}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid={zodValidation.success}
				suffix={null}
			/>
			<div style={fullWidth}>
				<InputDragger
					type={'number'}
					value={value}
					style={fullWidth}
					status={zodValidation.success ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					onTextChange={onTextChange}
					onValueChange={onNumberChange}
					onValueChangeEnd={onNumberChangeEnd}
					min={getZodNumberMinimum(schema)}
					max={getZodNumberMaximum(schema)}
					step={getZodNumberStep(schema)}
					rightAlign={false}
				/>
				<ZodFieldValidation path={jsonPath} zodValidation={zodValidation} />
			</div>
		</Fieldset>
	);
};
