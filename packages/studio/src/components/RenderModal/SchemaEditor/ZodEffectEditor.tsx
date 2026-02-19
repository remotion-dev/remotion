import React from 'react';
import {Fieldset} from './Fieldset';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {useLocalState} from './local-state';
import type {AnyZodSchema} from './zod-schema-type';
import {getEffectsInner, getZodSchemaType} from './zod-schema-type';
import type {JSONPath} from './zod-types';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodEffectEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: unknown;
	readonly setValue: UpdaterFunction<unknown>;
	readonly defaultValue: unknown;
	readonly onSave: UpdaterFunction<unknown>;
	readonly showSaveButton: boolean;
	readonly onRemove: null | (() => void);
	readonly saving: boolean;
	readonly mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	value,
	setValue: updateValue,
	defaultValue,
	onSave,
	onRemove,
	showSaveButton,
	saving,
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
					onSave={onSave}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					saveDisabledByParent={!localValue.zodValidation.success}
					mayPad={false}
				/>
			</div>
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
