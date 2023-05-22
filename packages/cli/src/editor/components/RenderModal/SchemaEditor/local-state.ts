import {useCallback, useRef, useState} from 'react';
import type {z} from 'zod';
import type {UpdaterFunction} from './ZodSwitch';

type LocalState<T> = {
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
		(updater: (oldV: T) => T, forceApply: boolean) => {
			const newValue = updater(stateRef.current.value);
			const safeParse = schema.safeParse(newValue);

			if (safeParse.success || forceApply) {
				setValue(updater, forceApply);
				setLocalValue((oldLocalState) => {
					return {
						revision: oldLocalState.revision + 1,
						value: newValue,
						zodValidation: safeParse,
					};
				});
			} else {
				setLocalValue((oldLocalState) => {
					return {
						revision: oldLocalState.revision + 1,
						value: newValue,
						zodValidation: safeParse,
					};
				});
			}
		},
		[schema, setValue]
	);

	return {localValue, onChange};
};
