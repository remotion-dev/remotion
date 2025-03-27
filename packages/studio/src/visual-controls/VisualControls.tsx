import React, {
	createContext,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {ZodTypeAny} from 'zod';

export type VisualControlValue = {
	valueInCode: unknown;
	schema: ZodTypeAny;
	stack: string;
};

export type VisualControlHook = {
	id: number;
	stack: string;
};

export type VisualControlsContextType = {
	controls: VisualControlHook[];
	handles: Record<number, Record<string, VisualControlValue>>;
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
	) => {same: boolean};
	updateHandles: () => void;
};

export const makeHook = (stack: string): VisualControlHook => {
	return {id: Math.random(), stack};
};

export const VisualControlsContext = createContext<VisualControlsContextType>({
	controls: [],
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
	});

export const VisualControlsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [controls, setControls] = useState<VisualControlHook[]>([]);

	const imperativeHandles = useRef<
		Record<number, Record<string, VisualControlValue>>
	>({});

	const [handles, setHandles] = useState<
		Record<number, Record<string, VisualControlValue>>
	>({});
	const [tabActivated, setTabActivated] = useState<boolean>(false);

	const addHook = useCallback(
		(hook: VisualControlHook) => {
			setControls((prev) => {
				if (prev.find((c) => c.id === hook.id)) {
					return prev;
				}

				return [...prev, hook];
			});
			setTabActivated(true);
		},
		[setControls],
	);

	const removeHook = useCallback(
		(hook: VisualControlHook) => {
			setControls((prev) => prev.filter((c) => c !== hook));
		},
		[setControls],
	);

	const setControl = useCallback(
		(hook: VisualControlHook, key: string, value: VisualControlValue) => {
			const current = imperativeHandles.current?.[hook.id]?.[key]?.valueInCode;

			if (current === value.valueInCode) {
				return {same: true};
			}

			imperativeHandles.current = {
				...imperativeHandles.current,
				[hook.id]: {...imperativeHandles.current[hook.id], [key]: value},
			};

			return {same: false};
		},
		[],
	);

	const updateHandles = useCallback(() => {
		setHandles(() => {
			return imperativeHandles.current;
		});
	}, []);

	const state: VisualControlsContextType = useMemo(() => {
		return {
			controls,
			handles,
		};
	}, [controls, handles]);

	const setState: SetVisualControlsContextType = useMemo(() => {
		return {
			addHook,
			removeHook,
			setControl,
			updateHandles,
		};
	}, [addHook, removeHook, setControl, updateHandles]);

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
