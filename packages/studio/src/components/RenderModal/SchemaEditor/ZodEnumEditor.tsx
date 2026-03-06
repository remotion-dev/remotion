import React, {useMemo} from 'react';
import {Checkmark} from '../../../icons/Checkmark';
import type {ComboboxValue} from '../../NewComposition/ComboBox';
import {Combobox} from '../../NewComposition/ComboBox';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {AnyZodSchema} from './zod-schema-type';
import {getEnumValues} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const container: React.CSSProperties = {
	width: '100%',
};

export const ZodEnumEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: string;
	readonly setValue: UpdaterFunction<string>;
	readonly onRemove: null | (() => void);
}> = ({schema, jsonPath, setValue, value, onRemove}) => {
	const {localValue, onChange: setLocalValue} = useLocalState({
		schema,
		setValue,
		value,
	});

	const enumValues = getEnumValues(schema);

	const isRoot = jsonPath.length === 0;

	const comboBoxValues = useMemo(() => {
		return enumValues.map((option: string): ComboboxValue => {
			return {
				value: option,
				label: option,
				id: option,
				keyHint: null,
				leftItem: option === value ? <Checkmark /> : null,
				onClick: (id: string) => {
					setLocalValue(() => id, false, false);
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
			};
		});
	}, [enumValues, setLocalValue, value]);

	return (
		<Fieldset shouldPad success={localValue.zodValidation.success}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid={localValue.zodValidation.success}
				suffix={null}
			/>

			<div style={isRoot ? undefined : container}>
				<Combobox values={comboBoxValues} selectedId={value} title={value} />
			</div>
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
