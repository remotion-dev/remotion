import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'remotion';
import {colorWithNewOpacity, parseColor} from '../../../../color-math';
import {Row, Spacing} from '../../layout';
import {InputDragger} from '../../NewComposition/InputDragger';
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

	const {a, b, g, r} = parseColor(localValue.value);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newColor = colorWithNewOpacity(e.target.value, Math.round(a));
			const safeParse = schema.safeParse(newColor);
			const newLocalState: LocalState = {
				value: newColor,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newColor);
			}
		},
		[a, schema, setValue]
	);
	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	const rgb = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;

	const status = localValue.zodValidation.success ? 'ok' : 'error';

	const colorPicker: React.CSSProperties = useMemo(() => {
		return {
			height: 37,
		};
	}, []);

	const onOpacityChange = useCallback(
		(newValue: string) => {
			const newColor = colorWithNewOpacity(
				localValue.value,
				Math.round((Number(newValue) / 100) * 255)
			);
			const safeParse = schema.safeParse(newColor);
			const newLocalState: LocalState = {
				value: newColor,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newColor);
			}
		},
		[localValue.value, schema, setValue]
	);

	const onOpacityValueChange = useCallback(
		(newValue: number) => {
			const newColor = colorWithNewOpacity(
				localValue.value,
				Math.round((Number(newValue) / 100) * 255)
			);

			const safeParse = schema.safeParse(newColor);
			const newLocalState: LocalState = {
				value: String(newColor),
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newColor);
			}
		},
		[localValue.value, schema, setValue]
	);

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
						value={rgb}
						onChange={onChange}
						className="__remotion_color_picker"
						status={status}
					/>
					<Spacing x={1} />
					<RemotionInput
						value={localValue.value}
						status={status}
						placeholder={jsonPath.join('.')}
						onChange={onChange}
					/>
					<Spacing x={1} />
					<InputDragger
						onTextChange={onOpacityChange}
						onValueChange={onOpacityValueChange}
						status={status}
						value={(a / 255) * 100}
						min={0}
						max={100}
						step={1}
						formatter={(v) => `${Number(v).toFixed(1)}%`}
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
