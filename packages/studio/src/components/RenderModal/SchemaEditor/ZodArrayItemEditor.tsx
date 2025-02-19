import {useCallback, useMemo} from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import type {JSONPath} from './zod-types';

export const ZodArrayItemEditor: React.FC<{
	jsonPath: JSONPath;
	onChange: UpdaterFunction<unknown[]>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	def: any;
	index: number;
	value: unknown;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown[]>;
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	def,
	onChange,
	jsonPath,
	index,
	value,
	defaultValue,
	onSave: onSaveObject,
	showSaveButton,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const onRemove = useCallback(() => {
		onChange(
			(oldV) => [...oldV.slice(0, index), ...oldV.slice(index + 1)],
			false,
			true,
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
				false,
				false,
			);
		},
		[index, onChange],
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
				false,
				false,
			);
		},
		[index, onSaveObject],
	);

	return (
		<div>
			<ZodSwitch
				jsonPath={newJsonPath}
				schema={def.type}
				value={value}
				setValue={setValue}
				defaultValue={defaultValue}
				onSave={onSave}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		</div>
	);
};
