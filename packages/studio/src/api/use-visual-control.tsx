import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {getRemotionEnvironment} from 'remotion';
import type {z} from 'zod';
import {useZodIfPossible} from '../components/get-zod-if-possible';
import {
	makeHook,
	SetVisualControlsContext,
	VisualControlsContext,
} from '../visual-controls/VisualControls';
import {getZodSchemaFromPrimitive} from './get-zod-schema-from-primitive';

type VisualControl = <T>(key: string, value: T, schema?: z.ZodTypeAny) => T;

type UseVisualControl = {
	visualControl: VisualControl;
};

export const useVisualControl = (): UseVisualControl => {
	const {addHook, removeHook, setControl, updateHandles} = useContext(
		SetVisualControlsContext,
	);
	const {handles} = useContext(VisualControlsContext);

	const changed = useRef(false);

	const [stack] = useState(() => {
		return new Error().stack as string;
	});

	const [hook] = useState(() => {
		return makeHook(stack);
	});

	useEffect(() => {
		if (!getRemotionEnvironment().isStudio) {
			return;
		}

		addHook(hook);
	}, [addHook, hook]);

	useEffect(() => {
		return () => {
			removeHook(hook);
		};
	}, [hook, removeHook]);

	useEffect(() => {
		if (changed.current) {
			updateHandles();
			changed.current = false;
		}
	}, [updateHandles]);

	const z = useZodIfPossible();

	return useMemo(
		() => ({
			visualControl<T>(key: string, value: T, schema?: z.ZodTypeAny): T {
				if (!getRemotionEnvironment().isStudio) {
					return value;
				}

				if (!z) {
					return value;
				}

				const {same, currentValue} = setControl(hook, key, {
					valueInCode: value,
					unsavedValue: value,
					schema: schema ?? getZodSchemaFromPrimitive(value, z),
					stack: new Error().stack as string,
				});

				if (!same) {
					changed.current = true;
				}

				return currentValue as T;
			},
		}),
		[handles, hook, setControl, z],
	);
};
