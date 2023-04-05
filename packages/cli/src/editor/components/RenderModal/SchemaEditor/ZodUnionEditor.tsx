import {z} from 'remotion';
import type {JSONPath} from './zod-types';
import {ZonNonEditableValue} from './ZodNonEditableValue';
import {ZodOrNullEditor} from './ZodOrNullEditor';

export const ZodUnionEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	compact: boolean;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
	onSave: (updater: (oldNum: unknown) => unknown) => void;
	onRemove: null | (() => void);
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
}) => {
	const {options} = schema._def as z.ZodUnionDef;

	if (options[0]._def.typeName === z.ZodFirstPartyTypeKind.ZodNull) {
		return (
			<ZodOrNullEditor
				compact={compact}
				defaultValue={defaultValue}
				jsonPath={jsonPath}
				onRemove={onRemove}
				onSave={onSave}
				schema={options[1]}
				setValue={setValue}
				showSaveButton={showSaveButton}
				value={value}
			/>
		);
	}

	if (options[1]._def.typeName === z.ZodFirstPartyTypeKind.ZodNull) {
		return (
			<ZodOrNullEditor
				compact={compact}
				defaultValue={defaultValue}
				jsonPath={jsonPath}
				onRemove={onRemove}
				onSave={onSave}
				schema={options[0]}
				setValue={setValue}
				showSaveButton={showSaveButton}
				value={value}
			/>
		);
	}

	return (
		<ZonNonEditableValue
			jsonPath={jsonPath}
			label={'Union only supported with null'}
			compact={compact}
			showSaveButton={showSaveButton}
		/>
	);
};
