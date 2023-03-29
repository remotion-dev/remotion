import {useCallback, useState} from 'react';
import {z} from 'remotion';
import {Checkbox} from '../../Checkbox';
import {narrowOption, optionRow} from '../layout';
import {SchemaLabel} from './SchemaLabel';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodUnionEditor: React.FC<{
	showSaveButton: boolean;
	jsonPath: JSONPath;
	compact: boolean;
	value: unknown;
	defaultValue: unknown;
	schema: z.ZodTypeAny;
	setValue: React.Dispatch<React.SetStateAction<any>>;
	onSave: (updater: (oldNum: unknown) => unknown) => void;
	onRemove: null | (() => void);
}> = ({
	jsonPath,
	compact,
	schema,
	setValue,
	onSave,
	defaultValue,
	value,
	showSaveButton,
	onRemove,
}) => {
	const {options} = schema._def;
	console.log({value});

	const [isChecked, setIsChecked] = useState<boolean>(false);
	const onValueChange = useCallback(
		(newValue: unknown) => {
			setValue(newValue);
		},
		[setValue]
	);

	const onCheckBoxChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setIsChecked(!isChecked);
				console.log(e.target.checked);
				const val = e.target.checked ? null : '';
				onValueChange(val);
			},
			[isChecked, onValueChange]
		);

	const onChange = useCallback(
		(newValue: unknown) => {
			setValue(newValue);
		},
		[setValue]
	);

	const reset = useCallback(() => {
		onValueChange(defaultValue);
	}, [defaultValue, onValueChange]);

	const save = useCallback(() => {
		onSave(() => value);
	}, [onSave, value]);

	console.log(value);

	if (
		options[0]._def.typeName === z.ZodFirstPartyTypeKind.ZodNull ||
		options[1]._def.typeName === z.ZodFirstPartyTypeKind.ZodNull
	) {
		return (
			<>
				<div style={compact ? narrowOption : optionRow}>
					<SchemaLabel
						isDefaultValue={value === defaultValue}
						jsonPath={jsonPath}
						onReset={reset}
						onSave={save}
						showSaveButton={showSaveButton}
						compact={compact}
						onRemove={onRemove}
					/>
					<div style={fullWidth}>
						<Checkbox
							checked={isChecked}
							onChange={onCheckBoxChange}
							disabled={false}
						/>
					</div>
				</div>
				<div style={fullWidth}>
					<ZodSwitch
						value={value}
						setValue={onChange}
						jsonPath={jsonPath}
						schema={
							options[0]._def.typeName === z.ZodFirstPartyTypeKind.ZodNull
								? options[1]
								: options[0]
						}
						compact={compact}
						defaultValue={defaultValue}
						onSave={onSave}
						showSaveButton={showSaveButton}
						onRemove={onRemove}
					/>
				</div>
			</>
		);
	}
};

// console.log(schema._def.options);
