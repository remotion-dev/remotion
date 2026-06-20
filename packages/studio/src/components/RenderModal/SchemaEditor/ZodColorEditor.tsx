import React, {useCallback, useMemo} from 'react';
import {ColorPicker} from '../../ColorPicker/ColorPicker';
import {Row, Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
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
	const localValue = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	const onPickerChange = useCallback(
		(next: string) => {
			setValue(() => next, {shouldSave: false});
		},
		[setValue],
	);

	const onPickerComplete = useCallback(
		(next: string) => {
			setValue(() => next, {shouldSave: true});
		},
		[setValue],
	);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newValue = e.target.value;
			setValue(() => newValue, {shouldSave: false});
		},
		[setValue],
	);

	const onTextBlur: React.FocusEventHandler<HTMLInputElement> =
		useCallback(() => {
			setValue(() => value, {shouldSave: true});
		}, [setValue, value]);

	const status = localValue.success ? 'ok' : 'error';

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
					<ColorPicker
						value={value}
						status={status}
						onChange={onPickerChange}
						onChangeComplete={onPickerComplete}
						width={45}
						height={39}
						name={jsonPath.join('.')}
					/>
					<Spacing x={1} block />
					<RemotionInput
						value={value}
						status={status}
						placeholder={jsonPath.join('.')}
						onChange={onTextChange}
						onBlur={onTextBlur}
						rightAlign={false}
						small
					/>
				</Row>
				<ZodFieldValidation path={jsonPath} zodValidation={localValue} />
			</div>
		</Fieldset>
	);
};
