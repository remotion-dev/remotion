import {useCallback, useMemo} from 'react';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

export const ZodArrayItemEditor: React.FC<{
	jsonPath: JSONPath;
	onChange: UpdaterFunction<unknown[]>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	def: any;
	index: number;
	value: unknown;
	compact: boolean;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown[]>;
	showSaveButton: boolean;
	saving: boolean;
}> = ({
	def,
	onChange,
	jsonPath,
	index,
	value,
	compact,
	defaultValue,
	onSave: onSaveObject,
	showSaveButton,
	saving,
}) => {
	const onRemove = useCallback(() => {
		onChange(
			(oldV) => [...oldV.slice(0, index), ...oldV.slice(index + 1)],
			true
		);
	}, [index, onChange]);

	const setValue = useCallback(
		(val: ((newV: unknown) => unknown) | unknown) => {
			onChange(
				(oldV) => [
					...oldV.slice(0, index),
					typeof val === 'function' ? val(oldV[index]) : val,
					...oldV.slice(index + 1),
				],
				false
			);
		},
		[index, onChange]
	);

	const newJsonPath = useMemo(() => [...jsonPath, index], [index, jsonPath]);

	const onSave = useCallback(
		(updater: (oldState: unknown) => unknown) => {
			onSaveObject(
				(oldV) => [
					...oldV.slice(0, index),
					updater(oldV[index]),
					...oldV.slice(index + 1),
				],
				false
			);
		},
		[index, onSaveObject]
	);

	return (
		<ZodSwitch
			jsonPath={newJsonPath}
			schema={def.type}
			value={value}
			setValue={setValue}
			compact={compact}
			defaultValue={defaultValue}
			onSave={onSave}
			showSaveButton={showSaveButton}
			onRemove={onRemove}
			saving={saving}
		/>
	);
};
