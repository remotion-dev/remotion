import type {z} from 'zod';
import type {JSONPath} from './zod-types';
import {ZodOrNullishEditor} from './ZodOrNullishEditor';

export const ZodNullableEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	compact: boolean;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: (updater: (oldNum: unknown) => unknown) => void;
	onSave: (updater: (oldNum: unknown) => unknown) => void;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
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
		/>
	);
};
