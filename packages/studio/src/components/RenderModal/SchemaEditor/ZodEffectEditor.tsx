import React, {useCallback, useMemo} from 'react';
import {Fieldset} from './Fieldset';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
import {getEffectsInner, getZodSchemaType} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodEffectEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: unknown;
	readonly setValue: UpdaterFunction<unknown>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({schema, jsonPath, value, setValue: updateValue, onRemove, mayPad}) => {
	const typeName = getZodSchemaType(schema);
	if (typeName !== 'effects') {
		throw new Error('expected effect');
	}

	const onChange: UpdaterFunction<unknown> = useCallback(
		(
			updater: (oldV: unknown) => unknown,
			{shouldSave}: {shouldSave: boolean},
		) => {
			updateValue(updater, {shouldSave});
		},
		[updateValue],
	);

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	const innerSchema = getEffectsInner(schema);

	return (
		<Fieldset shouldPad={mayPad}>
			<div style={fullWidth}>
				<ZodSwitch
					value={value}
					setValue={onChange}
					jsonPath={jsonPath}
					schema={innerSchema}
					onRemove={onRemove}
					mayPad={false}
				/>
			</div>
			<ZodFieldValidation path={jsonPath} zodValidation={zodValidation} />
		</Fieldset>
	);
};
