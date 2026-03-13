import {useMemo} from 'react';
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
import {SchemaLabel} from './SchemaLabel';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
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

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	const onCheckBoxChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				const val = e.target.checked
					? nullishValue
					: createZodValues(innerSchema, z, zodTypes);
				setValue(() => val, {shouldSave: true});
			},
			[innerSchema, nullishValue, setValue, z, zodTypes],
		);

	return (
		<Fieldset shouldPad={mayPad}>
			{value === nullishValue ? (
				<SchemaLabel
					handleClick={null}
					jsonPath={jsonPath}
					onRemove={onRemove}
					valid={zodValidation.success}
					suffix={null}
				/>
			) : (
				<ZodSwitch
					value={value}
					setValue={setValue}
					jsonPath={jsonPath}
					schema={innerSchema}
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
