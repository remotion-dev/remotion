import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {z} from 'zod';
import {deepEqual} from './deep-equal';
import type {UpdaterFunction} from './ZodSwitch';

export type LocalState<T> = {
	value: T;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
	keyStabilityRevision: number;
};

// With the revision context, the local state of children can get
// reset if the parent resets - then it increments the revision
type RevisionContextType = {
	childResetRevision: number;
};
const RevisionContext = createContext<RevisionContextType>({
	childResetRevision: 0,
});

export const useLocalState = <T,>({
	value,
	schema,
	setValue,
	defaultValue,
}: {
	value: T;
	schema: z.ZodTypeAny;
	setValue: UpdaterFunction<T>;
	defaultValue: T;
}) => {
	const parentRevision = useContext(RevisionContext).childResetRevision;

	const [resetRevision, setResetRevision] = useState(0);
	const [localValue, setLocalValue] = useState<Record<number, LocalState<T>>>(
		() => {
			return {};
		}
	);

	const currentLocalValue: LocalState<T> = useMemo(() => {
		return (
			localValue[parentRevision] ?? {
				value: defaultValue,
				keyStabilityRevision: 0,
				zodValidation: schema.safeParse(value),
			}
		);
	}, [defaultValue, localValue, parentRevision, schema, value]);

	const stateRef = useRef(currentLocalValue);
	stateRef.current = currentLocalValue;

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

			setLocalValue(() => {
				const newState = {
					keyStabilityRevision:
						currentLocalValue.keyStabilityRevision + (increment ? 1 : 0),
					value: newValue,
					zodValidation: safeParse,
				};

				stateRef.current = newState;

				return {
					...localValue,
					[parentRevision]: newState,
				};
			});
		},
		[
			currentLocalValue.keyStabilityRevision,
			localValue,
			parentRevision,
			schema,
			setValue,
		]
	);

	const contextValue: RevisionContextType = useMemo(() => {
		return {
			childResetRevision: resetRevision,
		};
	}, [resetRevision]);

	const reset = useCallback(() => {
		// Only need to do key stability for arrays, but
		// since user is not editing right now, should be fine
		onChange(() => defaultValue, true, true);
		setResetRevision((old) => old + 1);
	}, [defaultValue, onChange]);

	const RevisionContextProvider = useCallback(
		({children}: {children: React.ReactNode}) => {
			return (
				<RevisionContext.Provider value={contextValue}>
					{children}
				</RevisionContext.Provider>
			);
		},
		[contextValue]
	);

	return {
		localValue: currentLocalValue,
		onChange,
		reset,
		RevisionContextProvider,
	};
};
