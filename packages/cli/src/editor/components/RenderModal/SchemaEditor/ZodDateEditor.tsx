import React, {useCallback, useState} from 'react';
import type {z} from 'remotion';
import {VERY_LIGHT_TEXT} from '../../../helpers/colors';
import {Spacing, SPACING_UNIT} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';

type LocalState = {
	value: Date;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const explainer: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 12,
	color: VERY_LIGHT_TEXT,
	marginBottom: SPACING_UNIT,
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
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: Date;
	defaultValue: Date;
	setValue: React.Dispatch<React.SetStateAction<Date>>;
	onSave: (updater: (oldNum: unknown) => Date) => void;
	onRemove: null | (() => void);
	compact: boolean;
	showSaveButton: boolean;
	saving: boolean;
}> = ({
	jsonPath,
	value,
	setValue,
	showSaveButton,
	defaultValue,
	schema,
	compact,
	onSave,
	onRemove,
	saving,
}) => {
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value,
			zodValidation: schema.safeParse(value),
		};
	});

	const onValueChange = useCallback(
		(newValue: Date) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newValue);
			}
		},
		[schema, setValue]
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			// React does not support e.target.valueAsDate :(
			onValueChange(new Date(e.target.value));
		},
		[onValueChange]
	);

	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	return (
		<div style={compact ? narrowOption : optionRow}>
			<SchemaLabel
				compact={compact}
				isDefaultValue={value.getTime() === defaultValue.getTime()}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
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
				{!localValue.zodValidation.success && (
					<>
						<Spacing y={1} block />
						<ValidationMessage
							align="flex-end"
							message={localValue.zodValidation.error.format()._errors[0]}
							type="error"
						/>
					</>
				)}
			</div>
		</div>
	);
};
