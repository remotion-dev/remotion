import {useCallback} from 'react';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Checkbox} from '../../Checkbox';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Spacing} from '../../layout';
import {createZodValues} from './create-zod-values';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

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
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	schema: AnyZodSchema;
	innerSchema: AnyZodSchema;
	setValue: UpdaterFunction<unknown>;
	onRemove: null | (() => void);
	nullishValue: null | undefined;
	mayPad: boolean;
}> = ({
	jsonPath,
	schema,
	setValue,
	defaultValue,
	value,
	onRemove,
	nullishValue,
	mayPad,
	innerSchema,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const isChecked = value === nullishValue;

	const {localValue, onChange: setLocalValue} = useLocalState({
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

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			{localValue.value === nullishValue ? (
				<SchemaLabel
					handleClick={null}
					jsonPath={jsonPath}
					onRemove={onRemove}
					valid={localValue.zodValidation.success}
					suffix={null}
				/>
			) : (
				<ZodSwitch
					value={localValue.value}
					setValue={setLocalValue}
					jsonPath={jsonPath}
					schema={innerSchema}
					defaultValue={defaultValue}
					onRemove={onRemove}
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
