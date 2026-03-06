import React, {useCallback} from 'react';
import {Checkbox} from '../../Checkbox';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodBooleanEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: boolean;
	readonly setValue: UpdaterFunction<boolean>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({schema, jsonPath, value, setValue, onRemove, mayPad}) => {
	const {localValue, onChange} = useLocalState({
		schema,
		setValue,
		value,
	});

	const onToggle: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			onChange(() => e.target.checked, false, false);
		},
		[onChange],
	);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid
				suffix={null}
			/>
			<div style={fullWidth}>
				<Checkbox
					name={jsonPath.join('.')}
					checked={localValue.value}
					onChange={onToggle}
					disabled={false}
				/>
			</div>
		</Fieldset>
	);
};
