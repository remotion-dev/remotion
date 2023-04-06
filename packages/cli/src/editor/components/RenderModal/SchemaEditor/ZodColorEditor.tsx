import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'remotion';
import {Row, Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {RemInputTypeColor} from '../../NewComposition/RemInputTypeColor';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';

type LocalState = {
	value: string;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodColorEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: string;
	defaultValue: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	onSave: (updater: (oldNum: unknown) => string) => void;
	onRemove: null | (() => void);
	compact: boolean;
	showSaveButton: boolean;
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
}) => {
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value,
			zodValidation: schema.safeParse(value),
		};
	});

	const onValueChange = useCallback(
		(newValue: string) => {
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
			onValueChange(e.target.value);
		},
		[onValueChange]
	);
	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	const status = localValue.zodValidation.success ? 'ok' : 'error';

	const colorPicker: React.CSSProperties = useMemo(() => {
		return {
			height: 37,
		};
	}, []);

	return (
		<div style={compact ? narrowOption : optionRow}>
			<SchemaLabel
				compact={compact}
				isDefaultValue={value === defaultValue}
				jsonPath={jsonPath}
				onReset={reset}
				onSave={save}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
			<div style={fullWidth}>
				<Row align="center">
					<RemInputTypeColor
						style={colorPicker}
						type="color"
						value={localValue.value}
						onChange={onChange}
						className="__remotion_color_picker"
						status={status}
					/>
					<Spacing x={1} />
					<RemotionInput
						value={localValue.value}
						status={localValue.zodValidation.success ? 'ok' : 'error'}
						placeholder={jsonPath.join('.')}
						onChange={onChange}
					/>
				</Row>
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
