import {useCallback, useState} from 'react';
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
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {Fieldset} from './Fieldset';

type LocalState = {
	value: unknown;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const labelStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 14,
	color: LIGHT_TEXT,
};

const checkBoxWrapper: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	marginTop: '5px',
};

export const ZodOrNullishEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: UpdaterFunction<unknown>;
	onSave: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	nullishValue: null | undefined;
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
	nullishValue,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const isChecked = value === nullishValue;

	const [localNonNullishValueValue, setLocalNonNullishValue] =
		useState<LocalState>(() => {
			return {
				value,
				zodValidation:
					value === nullishValue
						? {success: true, data: value}
						: schema.safeParse(value),
			};
		});

	const onValueChange: UpdaterFunction<unknown> = useCallback(
		(updater) => {
			setLocalNonNullishValue((oldState) => {
				const newValue = updater(oldState.value);
				if (newValue === nullishValue) {
					return oldState;
				}

				return {
					value: newValue,
					zodValidation: schema.safeParse(newValue),
				};
			});
			setValue(updater, false);
		},
		[nullishValue, schema, setValue]
	);

	const onCheckBoxChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				const val = e.target.checked
					? nullishValue
					: localNonNullishValueValue.value === nullishValue
					? createZodValues(schema, z, zodTypes)
					: localNonNullishValueValue.value;

				if (val !== nullishValue) {
					setLocalNonNullishValue({
						value: val,
						zodValidation: schema.safeParse(val),
					});
				}

				onValueChange(() => val, false);
			},
			[
				localNonNullishValueValue,
				nullishValue,
				onValueChange,
				schema,
				z,
				zodTypes,
			]
		);

	const reset = useCallback(() => {
		onValueChange(() => defaultValue, true);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value, false);
	}, [onSave, value]);

	return (
		<Fieldset
			shouldPad
			success={localNonNullishValueValue.zodValidation.success}
		>
			{value === nullishValue ? (
				<SchemaLabel
					isDefaultValue={value === defaultValue}
					jsonPath={jsonPath}
					onReset={reset}
					onSave={save}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					valid={localNonNullishValueValue.zodValidation.success}
					saveDisabledByParent={saveDisabledByParent}
				/>
			) : (
				<ZodSwitch
					value={value}
					setValue={onValueChange}
					jsonPath={jsonPath}
					schema={schema}
					defaultValue={defaultValue}
					onSave={onSave}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					saveDisabledByParent={saveDisabledByParent}
					mayPad={mayPad}
				/>
			)}
			<div style={checkBoxWrapper}>
				<Checkbox
					checked={isChecked}
					onChange={onCheckBoxChange}
					disabled={false}
					name={jsonPath.join('.')}
				/>
				<Spacing x={1} />
				<div style={labelStyle}>{String(nullishValue)}</div>
			</div>
		</Fieldset>
	);
};
