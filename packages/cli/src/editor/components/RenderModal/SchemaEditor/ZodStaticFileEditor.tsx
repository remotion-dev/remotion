import React, {useCallback, useMemo} from 'react';
import {getStaticFiles} from 'remotion';
import type {z} from 'zod';
import {Checkmark} from '../../../icons/Checkmark';
import {useZodIfPossible} from '../../get-zod-if-possible';
import type {ComboboxValue} from '../../NewComposition/ComboBox';
import {Combobox} from '../../NewComposition/ComboBox';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {ZodFieldValidation} from './ZodFieldValidation';

const container: React.CSSProperties = {
	width: '100%',
};

export const ZodStaticFileEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: string;
	defaultValue: string;
	setValue: UpdaterFunction<string>;
	onSave: (updater: (oldState: string) => string) => void;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	setValue,
	defaultValue,
	value,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

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

	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodString) {
		throw new Error('expected enum');
	}

	const isRoot = jsonPath.length === 0;

	const comboBoxValues = useMemo(() => {
		return getStaticFiles().map((option): ComboboxValue => {
			return {
				value: option.src,
				label: option.name,
				id: option.src,
				keyHint: null,
				leftItem: option.src === value ? <Checkmark /> : null,
				onClick: (id: string) => {
					setLocalValue(() => id, false, false);
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
			};
		});
	}, [setLocalValue, value]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				onSave={save}
				showSaveButton={showSaveButton}
				isDefaultValue={localValue.value === defaultValue}
				onReset={reset}
				jsonPath={jsonPath}
				onRemove={onRemove}
				saving={saving}
				valid={localValue.zodValidation.success}
				saveDisabledByParent={saveDisabledByParent}
				suffix={null}
			/>

			<div style={isRoot ? undefined : container}>
				<Combobox
					values={comboBoxValues}
					selectedId={localValue.value}
					title={value}
				/>
			</div>
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
