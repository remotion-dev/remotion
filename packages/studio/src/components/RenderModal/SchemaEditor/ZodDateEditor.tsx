import React, {useCallback} from 'react';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const explainer: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 12,
	color: VERY_LIGHT_TEXT,
};

// This will do 2 things:
// - Make the calendar icon white
// Turn the input popup a dark mode input
const inputStyle: React.CSSProperties = {
	colorScheme: 'dark',
};

const formatDate = (date: Date) => {
	// Get the year, month, day, hours, minutes, seconds, and milliseconds
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // Month is zero-indexed, so we add 1
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	const milliseconds = date.getMilliseconds();

	// Format the date as a string
	const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day
		.toString()
		.padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds
		.toString()
		.padStart(3, '0')}`;

	return formattedDate;
};

export const ZodDateEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: Date;
	readonly setValue: UpdaterFunction<Date>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({jsonPath, value, setValue, schema, onRemove, mayPad}) => {
	const {localValue, onChange: setLocalValue} = useLocalState({
		schema,
		setValue,
		value,
	});

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			// React does not support e.target.valueAsDate :(
			setLocalValue(() => new Date(e.target.value), false, false);
		},
		[setLocalValue],
	);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid={localValue.zodValidation.success}
				suffix={null}
			/>
			<div style={fullWidth}>
				<RemotionInput
					value={formatDate(localValue.value)}
					type="datetime-local"
					status={localValue.zodValidation.success ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					onChange={onChange}
					style={inputStyle}
					rightAlign={false}
				/>
				<Spacing y={1} block />
				<div style={explainer}>Date is in local format</div>
				<ZodFieldValidation path={jsonPath} localValue={localValue} />
			</div>
		</Fieldset>
	);
};
