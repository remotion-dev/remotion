import {useCallback, useMemo} from 'react';
import type {z, ZodDiscriminatedUnionOption} from 'zod';
import {Checkmark} from '../../../icons/Checkmark';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import type {ComboboxValue} from '../../NewComposition/ComboBox';
import {Combobox} from '../../NewComposition/ComboBox';
import {createZodValues} from './create-zod-values';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {ObjectDiscrimatedUnionReplacement} from './ZodObjectEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import type {UpdaterFunction} from './ZodSwitch';

export const ZodDiscriminatedUnionEditor: React.FC<{
	schema: z.ZodTypeAny;
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

	const typedSchema = schema._def as z.ZodDiscriminatedUnionDef<string>;
	const options = useMemo(
		() => [...typedSchema.optionsMap.keys()],
		[typedSchema.optionsMap],
	) as string[];

	const {
		localValue,
		onChange: setLocalValue,
		reset,
	} = useLocalState({
		schema,
		setValue,
		value,
		defaultValue,
	});

	const comboBoxValues = useMemo(() => {
		return options.map((option): ComboboxValue => {
			return {
				value: option,
				label: option,
				id: option,
				keyHint: null,
				leftItem:
					option === value[typedSchema.discriminator] ? <Checkmark /> : null,
				onClick: () => {
					const val = createZodValues(
						typedSchema.optionsMap.get(
							option,
						) as ZodDiscriminatedUnionOption<never>,
						z,
						zodTypes,
					) as Record<string, unknown>;
					setLocalValue(() => val, false, false);
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
			};
		});
	}, [
		options,
		setLocalValue,
		typedSchema.discriminator,
		typedSchema.optionsMap,
		value,
		z,
		zodTypes,
	]);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	const discriminatedUnionReplacement: ObjectDiscrimatedUnionReplacement =
		useMemo(() => {
			return {
				discriminator: typedSchema.discriminator,
				markup: (
					<Fieldset key={'replacement'} shouldPad={mayPad} success>
						<SchemaLabel
							handleClick={null}
							isDefaultValue={
								localValue.value[typedSchema.discriminator] ===
								defaultValue[typedSchema.discriminator]
							}
							jsonPath={[...jsonPath, typedSchema.discriminator]}
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
							selectedId={value[typedSchema.discriminator] as string}
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
			typedSchema.discriminator,
			value,
		]);

	return (
		<ZodObjectEditor
			// Re-render the object editor when the discriminator changes
			key={value[typedSchema.discriminator] as string}
			jsonPath={jsonPath}
			mayPad={mayPad}
			defaultValue={defaultValue}
			onRemove={onRemove}
			onSave={onSave as UpdaterFunction<Record<string, unknown>>}
			saveDisabledByParent={saveDisabledByParent}
			saving={saving}
			schema={
				typedSchema.optionsMap.get(
					value[typedSchema.discriminator] as string,
				) as ZodDiscriminatedUnionOption<never>
			}
			setValue={setLocalValue}
			showSaveButton={showSaveButton}
			value={value}
			discriminatedUnionReplacement={discriminatedUnionReplacement}
		/>
	);
};
