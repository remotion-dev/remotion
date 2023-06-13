import React from 'react';
import type {z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {ZodFieldValidation} from './ZodFieldValidation';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodEffectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: UpdaterFunction<unknown>;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
	mayPad: boolean;
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
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {localValue, onChange} = useLocalState({
		value,
		schema,
		setValue: updateValue,
		defaultValue,
	});

	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodEffects) {
		throw new Error('expected effect');
	}

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<div style={fullWidth}>
				<ZodSwitch
					value={value}
					setValue={onChange}
					jsonPath={jsonPath}
					schema={def.schema}
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
