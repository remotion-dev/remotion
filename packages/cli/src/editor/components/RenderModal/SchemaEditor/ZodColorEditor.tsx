import React, {useCallback, useMemo} from 'react';
import type {z} from 'zod';
import {colorWithNewOpacity} from '../../../../color-math';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Row, Spacing} from '../../layout';
import {InputDragger} from '../../NewComposition/InputDragger';
import {RemotionInput} from '../../NewComposition/RemInput';
import {RemInputTypeColor} from '../../NewComposition/RemInputTypeColor';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {ZodFieldValidation} from './ZodFieldValidation';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodColorEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: string;
	defaultValue: string;
	setValue: UpdaterFunction<string>;
	onSave: UpdaterFunction<string>;
	onRemove: null | (() => void);
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
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
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();
	if (!zodTypes) {
		throw new Error('expected zod color');
	}

	const {
		localValue,
		onChange: onValueChange,
		reset,
	} = useLocalState({
		schema,
		setValue,
		value,
		defaultValue,
	});

	const {a, b, g, r} = localValue.zodValidation.success
		? zodTypes.ZodZypesInternals.parseColor(localValue.value)
		: {a: 1, b: 0, g: 0, r: 0};

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newColor = colorWithNewOpacity(
				e.target.value,
				Math.round(a),
				zodTypes
			);
			onValueChange(() => newColor, false, false);
		},
		[a, onValueChange, zodTypes]
	);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newValue = e.target.value;
			onValueChange(() => newValue, false, false);
		},
		[onValueChange]
	);

	const save = useCallback(() => {
		onSave(() => value, false, false);
	}, [onSave, value]);

	const rgb = `#${r.toString(16).padStart(2, '0')}${g
		.toString(16)
		.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

	const status = localValue.zodValidation.success ? 'ok' : 'error';

	const colorPicker: React.CSSProperties = useMemo(() => {
		return {
			height: 39,
			width: 45,
			display: 'inline-block',
		};
	}, []);

	const onOpacityChange = useCallback(
		(newValue: string) => {
			const newColor = colorWithNewOpacity(
				localValue.value,
				Math.round((Number(newValue) / 100) * 255),
				zodTypes
			);
			onValueChange(() => newColor, false, false);
		},
		[localValue.value, onValueChange, zodTypes]
	);

	const onOpacityValueChange = useCallback(
		(newValue: number) => {
			const newColor = colorWithNewOpacity(
				localValue.value,
				Math.round((Number(newValue) / 100) * 255),
				zodTypes
			);
			onValueChange(() => newColor, false, false);
		},
		[localValue.value, onValueChange, zodTypes]
	);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				isDefaultValue={localValue.value === defaultValue}
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
				<Row align="center">
					<div style={colorPicker}>
						<RemInputTypeColor
							type="color"
							style={{
								height: 39,
							}}
							value={rgb}
							onChange={onChange}
							className="__remotion_color_picker"
							status={status}
							name={jsonPath.join('.')}
						/>
					</div>
					<Spacing x={1} block />
					<RemotionInput
						value={localValue.value}
						status={status}
						placeholder={jsonPath.join('.')}
						onChange={onTextChange}
						rightAlign={false}
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
						formatter={(v) => `${Math.round(Number(v))}%`}
						rightAlign={false}
					/>
				</Row>
				<ZodFieldValidation path={jsonPath} localValue={localValue} />
			</div>
		</Fieldset>
	);
};
