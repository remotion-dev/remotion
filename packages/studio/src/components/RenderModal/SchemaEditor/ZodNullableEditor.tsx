import type {AnyZodSchema} from './zod-schema-type';
import {getInnerType} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodOrNullishEditor} from './ZodOrNullishEditor';
import type {UpdaterFunction} from './ZodSwitch';

export const ZodNullableEditor: React.FC<{
	jsonPath: JSONPath;
	value: unknown;
	schema: AnyZodSchema;
	setValue: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	mayPad: boolean;
}> = ({jsonPath, schema, setValue, value, onRemove, mayPad}) => {
	const innerType = getInnerType(schema);

	return (
		<ZodOrNullishEditor
			jsonPath={jsonPath}
			onRemove={onRemove}
			schema={schema}
			innerSchema={innerType}
			setValue={setValue}
			value={value}
			nullishValue={null}
			mayPad={mayPad}
		/>
	);
};
