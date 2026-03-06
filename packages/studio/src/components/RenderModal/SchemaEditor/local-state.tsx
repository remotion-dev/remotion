import {useCallback, useMemo, useRef} from 'react';
import {deepEqual} from './deep-equal';
import type {AnyZodSchema, ZodSafeParseResult} from './zod-schema-type';
import {zodSafeParse} from './zod-schema-type';
import type {UpdaterFunction} from './ZodSwitch';

export type LocalState<T> = {
	value: T;
	zodValidation: ZodSafeParseResult;
};

export const useLocalState = <T,>({
	value,
	schema,
	setValue,
}: {
	value: T;
	schema: AnyZodSchema;
	setValue: UpdaterFunction<T>;
}) => {
	const stateRef = useRef(value);
	stateRef.current = value;

	const onChange = useCallback(
		// Increment is to regenerate `key` attributes in array items,
		// so should increment when changing array items
		(updater: (oldV: T) => T, forceApply: boolean, increment: boolean) => {
			const newValue = updater(stateRef.current);
			const isSame = deepEqual(newValue, stateRef.current);
			if (isSame) {
				return;
			}

			const safeParse = zodSafeParse(schema, newValue);

			if (safeParse.success || forceApply) {
				setValue(updater, forceApply, increment);
			}
		},
		[schema, setValue],
	);

	return useMemo(
		() => ({
			localValue: {
				value,
				zodValidation: zodSafeParse(schema, value),
			},
			onChange,
		}),
		[value, onChange, schema],
	);
};
