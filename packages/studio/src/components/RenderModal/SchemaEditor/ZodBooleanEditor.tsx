import React, {useCallback} from 'react';
import {Checkbox} from '../../Checkbox';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {getUserFacingDescription, type AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
	display: 'block',
};

export const ZodBooleanEditor: React.FC<{
	readonly jsonPath: JSONPath;
	readonly value: boolean;
	readonly setValue: UpdaterFunction<boolean>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
	readonly schema: AnyZodSchema;
}> = ({jsonPath, value, setValue, onRemove, mayPad, schema}) => {
	const onToggle: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setValue(() => e.target.checked, {shouldSave: true});
		},
		[setValue],
	);

	return (
		<Fieldset shouldPad={mayPad}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid
				suffix={null}
				description={getUserFacingDescription(schema)}
			/>
			<label style={fullWidth} aria-label={jsonPath.join('.')}>
				<Checkbox
					name={jsonPath.join('.')}
					checked={value}
					onChange={onToggle}
					disabled={false}
				/>
			</label>
		</Fieldset>
	);
};
