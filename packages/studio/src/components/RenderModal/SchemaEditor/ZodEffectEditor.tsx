import React from 'react';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import type {AnyZodSchema} from './zod-schema-type';
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
	readonly defaultValue: unknown;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	value,
	setValue: updateValue,
	defaultValue,
	onRemove,
	mayPad,
}) => {
	const typeName = getZodSchemaType(schema);
	if (typeName !== 'effects') {
		throw new Error('expected effect');
	}

	const {localValue, onChange} = useLocalState({
		unsavedValue: value,
		schema,
		setValue: updateValue,
		savedValue: defaultValue,
	});

	const innerSchema = getEffectsInner(schema);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<div style={fullWidth}>
				<ZodSwitch
					value={value}
					setValue={onChange}
					jsonPath={jsonPath}
					schema={innerSchema}
					defaultValue={defaultValue}
					onRemove={onRemove}
					mayPad={false}
				/>
			</div>
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
