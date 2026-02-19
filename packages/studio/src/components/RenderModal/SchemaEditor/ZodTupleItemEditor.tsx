import {useCallback, useMemo} from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import type {AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';

export const ZodTupleItemEditor: React.FC<{
	jsonPath: JSONPath;
	onChange: UpdaterFunction<unknown[]>;
	tupleItems: AnyZodSchema[];
	index: number;
	value: unknown;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown[]>;
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	tupleItems,
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
				schema={tupleItems[index]}
				value={value}
				setValue={setValue}
				defaultValue={defaultValue}
				onSave={onSave}
				showSaveButton={showSaveButton}
				onRemove={null}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		</div>
	);
};
