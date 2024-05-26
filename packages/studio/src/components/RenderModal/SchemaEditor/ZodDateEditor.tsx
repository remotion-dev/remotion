import React, {useCallback} from 'react';
import type {z} from 'zod';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {RemotionInput} from '../../NewComposition/RemInput';
import {Spacing} from '../../layout';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';

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
	readonly schema: z.ZodTypeAny;
	readonly jsonPath: JSONPath;
	readonly value: Date;
	readonly defaultValue: Date;
	readonly setValue: UpdaterFunction<Date>;
	readonly onSave: UpdaterFunction<Date>;
	readonly onRemove: null | (() => void);
	readonly showSaveButton: boolean;
	readonly saving: boolean;
	readonly saveDisabledByParent: boolean;
	readonly mayPad: boolean;
}> = ({
	jsonPath,
	value,
	setValue,
	showSaveButton,
	defaultValue,
	schema,
	onSave,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
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

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			// React does not support e.target.valueAsDate :(
			setLocalValue(() => new Date(e.target.value), false, false);
		},
		[setLocalValue],
	);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				handleClick={null}
				isDefaultValue={localValue.value.getTime() === defaultValue.getTime()}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				valid={localValue.zodValidation.success}
				saveDisabledByParent={saveDisabledByParent}
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
