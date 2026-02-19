import {ZodOrNullishEditor} from './ZodOrNullishEditor';
import type {UpdaterFunction} from './ZodSwitch';
import type {AnyZodSchema} from './zod-schema-type';
import {getInnerType} from './zod-schema-type';
import type {JSONPath} from './zod-types';

export const ZodOptionalEditor: React.FC<{
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
	const innerType = getInnerType(schema);

	return (
		<ZodOrNullishEditor
			defaultValue={defaultValue}
			jsonPath={jsonPath}
			onRemove={onRemove}
			onSave={onSave}
			schema={schema}
			setValue={setValue}
			showSaveButton={showSaveButton}
			value={value}
			nullishValue={undefined}
			saving={saving}
			saveDisabledByParent={saveDisabledByParent}
			mayPad={mayPad}
			innerSchema={innerType}
		/>
	);
};
