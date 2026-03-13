import type {AnyZodSchema} from './zod-schema-type';
import {getUnionOptions, getZodSchemaType} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZonNonEditableValue} from './ZodNonEditableValue';
import {ZodOrNullishEditor} from './ZodOrNullishEditor';
import type {UpdaterFunction} from './ZodSwitch';

const findNull = (value: readonly AnyZodSchema[]) => {
	const nullIndex = value.findIndex((v) => {
		const type = getZodSchemaType(v);
		return type === 'null' || type === 'undefined';
	});
	if (nullIndex === -1) {
		return null;
	}

	const nullishValue =
		getZodSchemaType(value[nullIndex]) === 'null' ? null : undefined;

	const otherSchema = value[nullIndex === 0 ? 1 : 0];

	const otherType = getZodSchemaType(otherSchema);
	const otherSchemaIsAlsoNullish =
		otherType === 'null' || otherType === 'undefined';

	return {
		nullIndex,
		nullishValue,
		otherSchema,
		otherSchemaIsAlsoNullish,
	};
};

export const ZodUnionEditor: React.FC<{
	jsonPath: JSONPath;
	value: unknown;
	schema: AnyZodSchema;
	setValue: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	mayPad: boolean;
}> = ({jsonPath, schema, setValue, value, onRemove, mayPad}) => {
	const options = getUnionOptions(schema);

	if (options.length > 2) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'Union with more than 2 options not editable'}
				mayPad={mayPad}
			/>
		);
	}

	if (options.length < 2) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'Union with less than 2 options not editable'}
				mayPad={mayPad}
			/>
		);
	}

	const nullResult = findNull(options);

	if (!nullResult) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'Union only editable with 1 value being null'}
				mayPad={mayPad}
			/>
		);
	}

	const {otherSchema, nullishValue, otherSchemaIsAlsoNullish} = nullResult;

	if (otherSchemaIsAlsoNullish) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'Not editable - both union values are nullish'}
				mayPad={mayPad}
			/>
		);
	}

	return (
		<ZodOrNullishEditor
			jsonPath={jsonPath}
			onRemove={onRemove}
			schema={schema}
			innerSchema={otherSchema}
			setValue={setValue}
			value={value}
			nullishValue={nullishValue}
			mayPad={mayPad}
		/>
	);
};
