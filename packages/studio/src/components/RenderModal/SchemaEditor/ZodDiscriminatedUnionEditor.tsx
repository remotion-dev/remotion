import {useMemo} from 'react';
import {Checkmark} from '../../../icons/Checkmark';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import type {ComboboxValue} from '../../NewComposition/ComboBox';
import {Combobox} from '../../NewComposition/ComboBox';
import {createZodValues} from './create-zod-values';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
import {
	getDiscriminatedOption,
	getDiscriminatedOptionKeys,
	getDiscriminator,
} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {ObjectDiscrimatedUnionReplacement} from './ZodObjectEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import type {UpdaterFunction} from './ZodSwitch';

export const ZodDiscriminatedUnionEditor: React.FC<{
	schema: AnyZodSchema;
	setValue: UpdaterFunction<Record<string, unknown>>;
	value: Record<string, unknown>;
	mayPad: boolean;
	jsonPath: JSONPath;
	onRemove: null | (() => void);
}> = ({schema, setValue, value, mayPad, jsonPath, onRemove}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const discriminator = getDiscriminator(schema);
	const options = useMemo(
		() => getDiscriminatedOptionKeys(schema),
		[schema],
	) as string[];

	const comboBoxValues = useMemo(() => {
		return options.map((option): ComboboxValue => {
			return {
				value: option,
				label: option,
				id: option,
				keyHint: null,
				leftItem: option === value[discriminator] ? <Checkmark /> : null,
				onClick: () => {
					const optionSchema = getDiscriminatedOption(schema, option);
					if (!optionSchema) {
						throw new Error(
							`No schema found for discriminator value: ${option}`,
						);
					}

					const val = createZodValues(optionSchema, z, zodTypes) as Record<
						string,
						unknown
					>;
					setValue(() => val, {shouldSave: true});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
			};
		});
	}, [options, setValue, discriminator, schema, value, z, zodTypes]);

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	const discriminatedUnionReplacement: ObjectDiscrimatedUnionReplacement =
		useMemo(() => {
			return {
				discriminator,
				markup: (
					<Fieldset key={'replacement'} shouldPad={mayPad}>
						<SchemaLabel
							handleClick={null}
							jsonPath={[...jsonPath, discriminator]}
							onRemove={onRemove}
							suffix={null}
							valid={zodValidation.success}
						/>
						<Combobox
							title="Select type"
							values={comboBoxValues}
							selectedId={value[discriminator] as string}
						/>
					</Fieldset>
				),
			};
		}, [
			comboBoxValues,
			jsonPath,
			mayPad,
			onRemove,
			discriminator,
			value,
			zodValidation.success,
		]);

	const currentOptionSchema = getDiscriminatedOption(
		schema,
		value[discriminator] as string,
	);

	if (!currentOptionSchema) {
		throw new Error('No matching option found for discriminated union');
	}

	return (
		<ZodObjectEditor
			// Re-render the object editor when the discriminator changes
			key={value[discriminator] as string}
			jsonPath={jsonPath}
			mayPad={mayPad}
			onRemove={onRemove}
			schema={currentOptionSchema}
			setValue={setValue}
			value={value}
			discriminatedUnionReplacement={discriminatedUnionReplacement}
		/>
	);
};
