import {useCallback, useRef, useState} from 'react';
import type {z} from 'zod';
import {deepEqual} from './deep-equal';
import type {UpdaterFunction} from './ZodSwitch';

export type LocalState<T> = {
	value: T;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
	revision: number;
};

export const useLocalState = <T>({
	value,
	schema,
	setValue,
}: {
	value: T;
	schema: z.ZodTypeAny;
	setValue: UpdaterFunction<T>;
}) => {
	const [localValue, setLocalValue] = useState<LocalState<T>>(() => {
		return {
			value,
			zodValidation: schema.safeParse(value),
			revision: 0,
		};
	});
	const stateRef = useRef(localValue);
	stateRef.current = localValue;

	const onChange = useCallback(
		// Increment is to regenerate `key` attributes in array items,
		// so should increment when changing array items
		(updater: (oldV: T) => T, forceApply: boolean, increment: boolean) => {
			const newValue = updater(stateRef.current.value);
			const isSame = deepEqual(newValue, stateRef.current.value);
			if (isSame) {
				return;
			}

			const safeParse = schema.safeParse(newValue);

			if (safeParse.success || forceApply) {
				setValue(updater, forceApply, increment);
			}

			setLocalValue((oldLocalState) => {
				const newState = {
					revision: oldLocalState.revision + (increment ? 1 : 0),
					value: newValue,
					zodValidation: safeParse,
				};

				stateRef.current = newState;

				return newState;
			});
		},
		[schema, setValue]
	);

	return {localValue, onChange};
};
