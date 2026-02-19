import {useCallback, useMemo} from 'react';
import {Checkmark} from '../../../icons/Checkmark';
import type {ComboboxValue} from '../../NewComposition/ComboBox';
import {Combobox} from '../../NewComposition/ComboBox';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import type {ObjectDiscrimatedUnionReplacement} from './ZodObjectEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import type {UpdaterFunction} from './ZodSwitch';
import {createZodValues} from './create-zod-values';
import {useLocalState} from './local-state';
import type {AnyZodSchema} from './zod-schema-type';
import {
	getDiscriminatedOption,
	getDiscriminatedOptionKeys,
	getDiscriminator,
} from './zod-schema-type';
import type {JSONPath} from './zod-types';

export const ZodDiscriminatedUnionEditor: React.FC<{
	schema: AnyZodSchema;
	setValue: UpdaterFunction<Record<string, unknown>>;
	value: Record<string, unknown>;
	defaultValue: Record<string, unknown>;
	mayPad: boolean;
	jsonPath: JSONPath;
	onRemove: null | (() => void);
	onSave: UpdaterFunction<unknown>;
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
}> = ({
	schema,
	setValue,
	showSaveButton,
	saving,
	value,
	defaultValue,
	saveDisabledByParent,
	onSave,
	mayPad,
	jsonPath,
	onRemove,
}) => {
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
					setLocalValue(() => val, false, false);
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
			};
		});
	}, [options, setLocalValue, discriminator, schema, value, z, zodTypes]);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	const discriminatedUnionReplacement: ObjectDiscrimatedUnionReplacement =
		useMemo(() => {
			return {
				discriminator,
				markup: (
					<Fieldset key={'replacement'} shouldPad={mayPad} success>
						<SchemaLabel
							handleClick={null}
							isDefaultValue={
								localValue.value[discriminator] === defaultValue[discriminator]
							}
							jsonPath={[...jsonPath, discriminator]}
							onRemove={onRemove}
							onReset={reset}
							onSave={save}
							saveDisabledByParent={saveDisabledByParent}
							saving={saving}
							showSaveButton={showSaveButton}
							suffix={null}
							valid={localValue.zodValidation.success}
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
			defaultValue,
			jsonPath,
			localValue.value,
			localValue.zodValidation.success,
			mayPad,
			onRemove,
			reset,
			save,
			saveDisabledByParent,
			saving,
			showSaveButton,
			discriminator,
			value,
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
			savedValue={defaultValue}
			onRemove={onRemove}
			onSave={onSave as UpdaterFunction<Record<string, unknown>>}
			saveDisabledByParent={saveDisabledByParent}
			saving={saving}
			schema={currentOptionSchema}
			setValue={setLocalValue}
			showSaveButton={showSaveButton}
			unsavedValue={value}
			discriminatedUnionReplacement={discriminatedUnionReplacement}
		/>
	);
};
