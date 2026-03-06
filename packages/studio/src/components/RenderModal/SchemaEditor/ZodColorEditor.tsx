import React, {useCallback, useMemo} from 'react';
import {colorWithNewOpacity} from '../../../helpers/color-math';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Row, Spacing} from '../../layout';
import {InputDragger} from '../../NewComposition/InputDragger';
import {RemotionInput} from '../../NewComposition/RemInput';
import {RemInputTypeColor} from '../../NewComposition/RemInputTypeColor';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodColorEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: string;
	readonly setValue: UpdaterFunction<string>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({jsonPath, value, setValue, schema, onRemove, mayPad}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();
	if (!zodTypes) {
		throw new Error('expected zod color');
	}

	const localValue = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	const {a, b, g, r} = localValue.success
		? zodTypes.ZodZypesInternals.parseColor(value)
		: {a: 1, b: 0, g: 0, r: 0};

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newColor = colorWithNewOpacity(
				e.target.value,
				Math.round(a),
				zodTypes,
			);
			setValue(() => newColor);
		},
		[a, setValue, zodTypes],
	);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newValue = e.target.value;
			setValue(() => newValue);
		},
		[setValue],
	);

	const rgb = `#${r.toString(16).padStart(2, '0')}${g
		.toString(16)
		.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

	const status = localValue.success ? 'ok' : 'error';

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
				value,
				Math.round((Number(newValue) / 100) * 255),
				zodTypes,
			);
			setValue(() => newColor);
		},
		[setValue, value, zodTypes],
	);

	const onOpacityValueChange = useCallback(
		(newValue: number) => {
			const newColor = colorWithNewOpacity(
				value,
				Math.round((Number(newValue) / 100) * 255),
				zodTypes,
			);
			setValue(() => newColor);
		},
		[setValue, value, zodTypes],
	);

	return (
		<Fieldset shouldPad={mayPad}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid={localValue.success}
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
						value={value}
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
				<ZodFieldValidation path={jsonPath} zodValidation={localValue} />
			</div>
		</Fieldset>
	);
};
