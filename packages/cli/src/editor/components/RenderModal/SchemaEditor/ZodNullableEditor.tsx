import type {z} from 'zod';
import type {JSONPath} from './zod-types';
import {ZodOrNullishEditor} from './ZodOrNullishEditor';
import type {UpdaterFunction} from './ZodSwitch';

export const ZodNullableEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	compact: boolean;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: UpdaterFunction<unknown>;
	onSave: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	jsonPath,
	compact,
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
	const {innerType} = schema._def as z.ZodOptionalDef;

	return (
		<ZodOrNullishEditor
			compact={compact}
			defaultValue={defaultValue}
			jsonPath={jsonPath}
			onRemove={onRemove}
			onSave={onSave}
			schema={innerType}
			setValue={setValue}
			showSaveButton={showSaveButton}
			value={value}
			nullishValue={null}
			saving={saving}
			saveDisabledByParent={saveDisabledByParent}
			mayPad={mayPad}
		/>
	);
};
