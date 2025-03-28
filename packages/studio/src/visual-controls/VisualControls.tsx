import React, {
	createContext,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {ZodTypeAny} from 'zod';
import {getVisualControlEditedValue} from './get-current-edited-value';

export type VisualControlValue = {
	valueInCode: unknown;
	unsavedValue: unknown;
	schema: ZodTypeAny;
	stack: string;
};

export type VisualControlHook = {
	id: number;
	stack: string;
};

type Handle = Record<string, VisualControlValue>;

export type Handles = Record<number, Handle>;

export type VisualControlsContextType = {
	hooks: VisualControlHook[];
	handles: Handles;
};

type VisualControlsTabActivated = boolean;

export const VisualControlsTabActivatedContext =
	createContext<VisualControlsTabActivated>(false);

export type SetVisualControlsContextType = {
	addHook: (hook: VisualControlHook) => void;
	removeHook: (hook: VisualControlHook) => void;
	setControl: (
		hook: VisualControlHook,
		key: string,
		value: VisualControlValue,
	) => {same: boolean; currentValue: unknown};
	updateHandles: () => void;
	updateValue: (hook: VisualControlHook, key: string, value: unknown) => void;
};

export const makeHook = (stack: string): VisualControlHook => {
	return {id: Math.random(), stack};
};

export const VisualControlsContext = createContext<VisualControlsContextType>({
	hooks: [],
	handles: {},
});

export const SetVisualControlsContext =
	createContext<SetVisualControlsContextType>({
		addHook: () => {
			throw new Error('addControl is not implemented');
		},
		removeHook: () => {
			throw new Error('removeControl is not implemented');
		},
		setControl: () => {
			throw new Error('addControl is not implemented');
		},
		updateHandles: () => {
			throw new Error('updateHandles is not implemented');
		},
		updateValue: () => {
			throw new Error('updateValue is not implemented');
		},
	});

export const VisualControlsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [hooks, setHooks] = useState<VisualControlHook[]>([]);

	const imperativeHandles = useRef<
		Record<number, Record<string, VisualControlValue>>
	>({});

	const [handles, setHandles] = useState<
		Record<number, Record<string, VisualControlValue>>
	>({});
	const [tabActivated, setTabActivated] = useState<boolean>(false);

	const addHook = useCallback(
		(hook: VisualControlHook) => {
			setHooks((prev) => {
				if (prev.find((c) => c.id === hook.id)) {
					return prev;
				}

				return [...prev, hook];
			});
			setTabActivated(true);
		},
		[setHooks],
	);

	const removeHook = useCallback(
		(hook: VisualControlHook) => {
			setHooks((prev) => prev.filter((c) => c !== hook));
		},
		[setHooks],
	);

	const state: VisualControlsContextType = useMemo(() => {
		return {
			hooks,
			handles,
		};
	}, [hooks, handles]);

	const setControl = useCallback(
		(hook: VisualControlHook, key: string, value: VisualControlValue) => {
			const currentSaved =
				imperativeHandles.current?.[hook.id]?.[key]?.valueInCode;
			const currentUnsaved =
				imperativeHandles.current?.[hook.id]?.[key]?.unsavedValue;

			if (currentSaved === value.valueInCode) {
				return {
					same: true,
					currentValue: getVisualControlEditedValue({
						hook,
						key,
						handles: imperativeHandles.current,
					}),
				};
			}

			imperativeHandles.current = {
				...imperativeHandles.current,
				[hook.id]: {
					...imperativeHandles.current[hook.id],
					[key]: {
						...value,
						unsavedValue: currentUnsaved ?? value.valueInCode,
					},
				},
			};

			return {
				same: false,
				currentValue: getVisualControlEditedValue({
					hook,
					key,
					handles: imperativeHandles.current,
				}),
			};
		},
		[],
	);

	const updateHandles = useCallback(() => {
		setHandles(() => {
			return imperativeHandles.current;
		});
	}, []);

	const updateValue = useCallback(
		(hook: VisualControlHook, key: string, value: unknown) => {
			imperativeHandles.current = {
				...imperativeHandles.current,
				[hook.id]: {
					...imperativeHandles.current[hook.id],
					[key]: {
						...imperativeHandles.current[hook.id][key],
						unsavedValue: value,
					},
				},
			};
			updateHandles();
		},
		[updateHandles],
	);

	const setState: SetVisualControlsContextType = useMemo(() => {
		return {
			addHook,
			removeHook,
			setControl,
			updateHandles,
			updateValue,
		};
	}, [addHook, removeHook, setControl, updateHandles, updateValue]);

	return (
		<VisualControlsTabActivatedContext.Provider value={tabActivated}>
			<VisualControlsContext.Provider value={state}>
				<SetVisualControlsContext.Provider value={setState}>
					{children}
				</SetVisualControlsContext.Provider>
			</VisualControlsContext.Provider>
		</VisualControlsTabActivatedContext.Provider>
	);
};
