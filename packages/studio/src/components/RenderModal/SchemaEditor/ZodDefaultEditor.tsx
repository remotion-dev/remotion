import React from 'react';
import type {AnyZodSchema} from './zod-schema-type';
import {getInnerType} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

export const ZodDefaultEditor: React.FC<{
	readonly jsonPath: JSONPath;
	readonly value: unknown;
	readonly schema: AnyZodSchema;
	readonly setValue: UpdaterFunction<unknown>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({jsonPath, schema, setValue, value, onRemove, mayPad}) => {
	const innerType = getInnerType(schema);

	return (
		<ZodSwitch
			jsonPath={jsonPath}
			onRemove={onRemove}
			schema={innerType}
			setValue={setValue}
			value={value}
			mayPad={mayPad}
		/>
	);
};
