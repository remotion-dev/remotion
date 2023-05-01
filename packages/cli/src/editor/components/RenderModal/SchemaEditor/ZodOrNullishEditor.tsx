import {useCallback} from 'react';
import type {z} from 'zod';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Checkbox} from '../../Checkbox';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {createZodValues} from './create-zod-values';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const labelStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 14,
	color: LIGHT_TEXT,
};

const checkBoxWrapper: React.CSSProperties = {
	margin: '2px',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	marginTop: '5px',
};

export const ZodOrNullishEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	compact: boolean;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
	onSave: (updater: (oldNum: unknown) => unknown) => void;
	onRemove: null | (() => void);
	nullishValue: null | undefined;
	saving: boolean;
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
	nullishValue,
	saving,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const isChecked = value === nullishValue;

	const onValueChange = useCallback(
		(newValue: unknown) => {
			setValue(newValue);
		},
		[setValue]
	);

	const onCheckBoxChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				const val = e.target.checked
					? nullishValue
					: createZodValues(schema, z, zodTypes);
				onValueChange(val);
			},
			[nullishValue, onValueChange, schema, z, zodTypes]
		);

	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	return (
		<>
			{value === nullishValue ? (
				<SchemaLabel
					isDefaultValue={value === defaultValue}
					jsonPath={jsonPath}
					onReset={reset}
					onSave={save}
					showSaveButton={showSaveButton}
					compact={compact}
					onRemove={onRemove}
					saving={saving}
				/>
			) : (
				<div style={fullWidth}>
					<ZodSwitch
						value={value}
						setValue={onValueChange}
						jsonPath={jsonPath}
						schema={schema}
						compact={compact}
						defaultValue={defaultValue}
						onSave={onSave}
						showSaveButton={showSaveButton}
						onRemove={onRemove}
						saving={saving}
					/>
				</div>
			)}
			<div style={checkBoxWrapper}>
				<Checkbox
					checked={isChecked}
					onChange={onCheckBoxChange}
					disabled={false}
				/>
				<Spacing x={1} />
				<div style={labelStyle}>{String(nullishValue)}</div>
			</div>
		</>
	);
};
