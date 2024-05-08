import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {z} from 'zod';
import {PROPS_UPDATED_EXTERNALLY} from '../../../api/update-default-props';
import type {UpdaterFunction} from './ZodSwitch';
import {deepEqual} from './deep-equal';

export type LocalState<T> = {
	value: T;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
	keyStabilityRevision: number;
};

// With the revision context, the local state of children can get
// reset if the parent resets - then it increments the revision
export type RevisionContextType = {
	childResetRevision: number;
};
export const RevisionContext = createContext<RevisionContextType>({
	childResetRevision: 0,
});

export const useLocalState = <T,>({
	unsavedValue,
	schema,
	setValue,
	savedValue,
}: {
	unsavedValue: T;
	schema: z.ZodTypeAny;
	setValue: UpdaterFunction<T>;
	savedValue: T;
}) => {
	const parentRevision = useContext(RevisionContext).childResetRevision;

	const [resetRevision, setResetRevision] = useState(0);
	const [localValueOrNull, setLocalValue] = useState<Record<
		number,
		LocalState<T>
	> | null>(() => {
		return {
			[parentRevision]: {
				value: unsavedValue,
				keyStabilityRevision: 0,
				zodValidation: schema.safeParse(unsavedValue),
			},
		};
	});

	const localValue = useMemo(() => {
		if (localValueOrNull === null) {
			return {
				[parentRevision]: {
					value: unsavedValue,
					keyStabilityRevision: 0,
					zodValidation: schema.safeParse(unsavedValue),
				},
			};
		}

		return localValueOrNull;
	}, [localValueOrNull, parentRevision, schema, unsavedValue]);

	useEffect(() => {
		const checkFile = () => {
			setResetRevision((old) => old + 1);
			setLocalValue(null);
		};

		window.addEventListener(PROPS_UPDATED_EXTERNALLY, checkFile);

		return () => {
			window.removeEventListener(PROPS_UPDATED_EXTERNALLY, checkFile);
		};
	}, []);

	const currentLocalValue: LocalState<T> = useMemo(() => {
		return (
			localValue[parentRevision] ?? {
				value: savedValue,
				keyStabilityRevision: 0,
				zodValidation: schema.safeParse(savedValue),
			}
		);
	}, [savedValue, localValue, parentRevision, schema]);

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
		],
	);

	const contextValue: RevisionContextType = useMemo(() => {
		return {
			childResetRevision: resetRevision,
		};
	}, [resetRevision]);

	const reset = useCallback(() => {
		// Only need to do key stability for arrays, but
		// since user is not editing right now, should be fine
		onChange(() => savedValue, true, true);
		setResetRevision((old) => old + 1);
	}, [savedValue, onChange]);

	const RevisionContextProvider = useCallback(
		({children}: {children: React.ReactNode}) => {
			return (
				<RevisionContext.Provider value={contextValue}>
					{children}
				</RevisionContext.Provider>
			);
		},
		[contextValue],
	);

	return useMemo(
		() => ({
			localValue: currentLocalValue,
			onChange,
			reset,
			RevisionContextProvider,
		}),
		[RevisionContextProvider, currentLocalValue, onChange, reset],
	);
};
