import type {z} from 'zod';
import type {JSONPath} from './zod-types';
import {ZodOrNullishEditor} from './ZodOrNullishEditor';
import type {UpdaterFunction} from './ZodSwitch';

export const ZodOptionalEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: UpdaterFunction<unknown>;
	onSave: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
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
}) => {
	const {innerType} = schema._def as z.ZodOptionalDef;

	return (
		<ZodOrNullishEditor
			defaultValue={defaultValue}
			jsonPath={jsonPath}
			onRemove={onRemove}
			onSave={onSave}
			schema={innerType}
			setValue={setValue}
			showSaveButton={showSaveButton}
			value={value}
			nullishValue={undefined}
			saving={saving}
			saveDisabledByParent={saveDisabledByParent}
			mayPad={false}
		/>
	);
};
