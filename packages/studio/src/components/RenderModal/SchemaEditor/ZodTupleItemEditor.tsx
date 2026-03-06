import {useCallback, useMemo} from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import type {AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

export const ZodTupleItemEditor: React.FC<{
	jsonPath: JSONPath;
	onChange: UpdaterFunction<unknown[]>;
	tupleItems: AnyZodSchema[];
	index: number;
	value: unknown;
	defaultValue: unknown;
	mayPad: boolean;
}> = ({tupleItems, onChange, jsonPath, index, value, defaultValue, mayPad}) => {
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

	return (
		<div>
			<ZodSwitch
				jsonPath={newJsonPath}
				schema={tupleItems[index]}
				value={value}
				setValue={setValue}
				defaultValue={defaultValue}
				onRemove={null}
				mayPad={mayPad}
			/>
		</div>
	);
};
