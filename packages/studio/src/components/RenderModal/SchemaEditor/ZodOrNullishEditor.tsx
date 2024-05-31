import {useCallback} from 'react';
import type {z} from 'zod';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Checkbox} from '../../Checkbox';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {createZodValues} from './create-zod-values';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';

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
	innerSchema: z.ZodTypeAny;
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
	innerSchema,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const isChecked = value === nullishValue;

	const {
		localValue,
		onChange: setLocalValue,
		reset,
	} = useLocalState({
		schema,
		setValue,
		unsavedValue: value,
		savedValue: defaultValue,
	});

	const onCheckBoxChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				const val = e.target.checked
					? nullishValue
					: createZodValues(innerSchema, z, zodTypes);
				setLocalValue(() => val, false, false);
			},
			[innerSchema, nullishValue, setLocalValue, z, zodTypes],
		);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			{localValue.value === nullishValue ? (
				<SchemaLabel
					handleClick={null}
					isDefaultValue={localValue.value === defaultValue}
					jsonPath={jsonPath}
					onReset={reset}
					onSave={save}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					valid={localValue.zodValidation.success}
					saveDisabledByParent={saveDisabledByParent}
					suffix={null}
				/>
			) : (
				<ZodSwitch
					value={localValue.value}
					setValue={setLocalValue}
					jsonPath={jsonPath}
					schema={innerSchema}
					defaultValue={defaultValue}
					onSave={onSave}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					saveDisabledByParent={saveDisabledByParent}
					mayPad={false}
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
