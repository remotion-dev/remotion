import React from 'react';
import type {z} from 'zod';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import type {JSONPath} from './zod-types';

export const ZodDefaultEditor: React.FC<{
	readonly showSaveButton: boolean;
	readonly jsonPath: JSONPath;
	readonly value: unknown;
	readonly defaultValue: unknown;
	readonly schema: z.ZodTypeAny;
	readonly setValue: UpdaterFunction<unknown>;
	readonly onSave: UpdaterFunction<unknown>;
	readonly onRemove: null | (() => void);
	readonly saving: boolean;
	readonly saveDisabledByParent: boolean;
	readonly mayPad: boolean;
}> = ({
	jsonPath,
	schema,
	setValue,
	onSave,
	defaultValue,
	value,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const {innerType} = schema._def as z.ZodDefaultDef;

	return (
		<ZodSwitch
			defaultValue={defaultValue}
			jsonPath={jsonPath}
			onRemove={onRemove}
			onSave={onSave}
			schema={innerType}
			setValue={setValue}
			showSaveButton={showSaveButton}
			value={value}
			saving={saving}
			saveDisabledByParent={saveDisabledByParent}
			mayPad={mayPad}
		/>
	);
};
