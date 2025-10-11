import React, {
	createContext,
	createRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {useRemotionEnvironment} from 'remotion';
import type {z, ZodTypeAny} from 'zod';
import {getZodSchemaFromPrimitive} from '../api/get-zod-schema-from-primitive';
import {useZodIfPossible} from '../components/get-zod-if-possible';
import {getVisualControlEditedValue} from './get-current-edited-value';

export type VisualControlValueWithoutUnsaved = {
	valueInCode: unknown;
	schema: ZodTypeAny;
	stack: string;
};

export type VisualControlValue = VisualControlValueWithoutUnsaved & {
	unsavedValue: unknown;
};

export type Handles = Record<string, VisualControlValue>;

export type VisualControlsContextType = {
	handles: Handles;
};

type VisualControlsTabActivated = boolean;

export const VisualControlsTabActivatedContext =
	createContext<VisualControlsTabActivated>(false);

export type SetVisualControlsContextType = {
	updateHandles: () => void;
	updateValue: (key: string, value: unknown) => void;
	visualControl: <T>(key: string, value: T, schema?: z.ZodTypeAny) => T;
};

export const VisualControlsContext = createContext<VisualControlsContextType>({
	handles: {},
});

export type VisualControlRef = {
	// May not call it visualControl, because we rely on stacktrace names
	globalVisualControl: <T>(key: string, value: T, schema?: z.ZodTypeAny) => T;
};

export const visualControlRef = createRef<VisualControlRef>();

export const SetVisualControlsContext =
	createContext<SetVisualControlsContextType>({
		updateHandles: () => {
			throw new Error('updateHandles is not implemented');
		},
		updateValue: () => {
			throw new Error('updateValue is not implemented');
		},
		visualControl: () => {
			throw new Error('visualControl is not implemented');
		},
	});

export const VisualControlsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const imperativeHandles = useRef<Record<string, VisualControlValue>>({});

	const [handles, setHandles] = useState<Record<string, VisualControlValue>>(
		{},
	);

	const state: VisualControlsContextType = useMemo(() => {
		return {
			handles,
		};
	}, [handles]);

	const setControl = useCallback(
		(key: string, value: VisualControlValueWithoutUnsaved) => {
			const currentUnsaved = imperativeHandles.current?.[key]?.unsavedValue;
			const currentSavedState = imperativeHandles.current?.[key]?.valueInCode;

			const changedSavedValue = value.valueInCode !== currentSavedState;
			const changedUnsavedValue =
				currentUnsaved === undefined && value.valueInCode !== undefined;

			imperativeHandles.current = {
				...imperativeHandles.current,
				[key]: {
					...value,
					unsavedValue: currentUnsaved ?? value.valueInCode,
					valueInCode: value.valueInCode,
				},
			};

			return {
				changed: changedSavedValue || changedUnsavedValue,
				currentValue: getVisualControlEditedValue({
					key,
					handles: imperativeHandles.current,
				}),
			};
		},
		[],
	);

	const z = useZodIfPossible();

	const changedRef = useRef(false);
	const env = useRemotionEnvironment();

	const visualControl = useCallback(
		// eslint-disable-next-line prefer-arrow-callback
		function <T>(key: string, value: T, schema?: z.ZodTypeAny): T {
			// eslint-disable-next-line no-constant-condition
			if (handles && false) {
				/** Intentional: State is managed imperatively */
			}

			if (!env.isStudio) {
				return value;
			}

			if (!z) {
				return value;
			}

			const {changed, currentValue} = setControl(key, {
				valueInCode: value,
				schema: schema ?? getZodSchemaFromPrimitive(value, z),
				stack: new Error().stack as string,
			});

			if (changed) {
				changedRef.current = true;
			}

			return currentValue as T;
		},
		[setControl, handles, z, env.isStudio],
	);

	const updateHandles = useCallback(() => {
		setHandles(() => {
			return imperativeHandles.current;
		});
	}, []);

	const updateValue = useCallback(
		(key: string, value: unknown) => {
			imperativeHandles.current = {
				...imperativeHandles.current,
				[key]: {
					...imperativeHandles.current[key],
					unsavedValue: value,
				},
			};
			updateHandles();
		},
		[updateHandles],
	);

	useImperativeHandle(visualControlRef, () => {
		return {
			globalVisualControl: visualControl,
		};
	}, [visualControl]);

	useEffect(() => {
		const callback = () => {
			if (imperativeHandles.current) {
				updateHandles();
				changedRef.current = false;
			}
		};

		const interval = setInterval(callback, 100);

		return () => {
			clearInterval(interval);
		};
	}, [updateHandles]);

	const setState: SetVisualControlsContextType = useMemo(() => {
		return {
			setControl,
			updateHandles,
			updateValue,
			visualControl,
		};
	}, [setControl, updateHandles, updateValue, visualControl]);

	return (
		<VisualControlsTabActivatedContext.Provider
			value={Object.keys(state.handles).length > 0}
		>
			<VisualControlsContext.Provider value={state}>
				<SetVisualControlsContext.Provider value={setState}>
					{children}
				</SetVisualControlsContext.Provider>
			</VisualControlsContext.Provider>
		</VisualControlsTabActivatedContext.Provider>
	);
};
