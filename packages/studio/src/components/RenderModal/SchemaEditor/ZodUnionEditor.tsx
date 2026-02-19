import {ZonNonEditableValue} from './ZodNonEditableValue';
import {ZodOrNullishEditor} from './ZodOrNullishEditor';
import type {UpdaterFunction} from './ZodSwitch';
import type {AnyZodSchema} from './zod-schema-type';
import {getUnionOptions, getZodSchemaType} from './zod-schema-type';
import type {JSONPath} from './zod-types';

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
	showSaveButton: boolean;
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	schema: AnyZodSchema;
	setValue: UpdaterFunction<unknown>;
	onSave: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
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
	const options = getUnionOptions(schema);

	if (options.length > 2) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'Union with more than 2 options not editable'}
				showSaveButton={showSaveButton}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (options.length < 2) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'Union with less than 2 options not editable'}
				showSaveButton={showSaveButton}
				saving={saving}
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
				showSaveButton={showSaveButton}
				saving={saving}
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
				showSaveButton={showSaveButton}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	return (
		<ZodOrNullishEditor
			defaultValue={defaultValue}
			jsonPath={jsonPath}
			onRemove={onRemove}
			onSave={onSave}
			schema={schema}
			innerSchema={otherSchema}
			setValue={setValue}
			showSaveButton={showSaveButton}
			value={value}
			nullishValue={nullishValue}
			saving={saving}
			saveDisabledByParent={saveDisabledByParent}
			mayPad={mayPad}
		/>
	);
};
