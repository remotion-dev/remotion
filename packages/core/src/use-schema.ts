/* eslint-disable react-hooks/rules-of-hooks */
import {useContext, useMemo, useState} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import {getEffectiveVisualModeValue} from './get-effective-visual-mode-value.js';
import type {
	SchemaKeysRecord,
	SequenceSchema,
} from './sequence-field-schema.js';
import {VisualModeOverridesContext} from './SequenceManager.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';

export type CanUpdateSequencePropStatus =
	| {canUpdate: true; codeValue: unknown}
	| {canUpdate: false; reason: 'computed'};

export const useSchema = <
	S extends SequenceSchema,
	T extends SchemaKeysRecord<S>,
>(
	schema: S | null,
	currentValue: (T & Record<Exclude<keyof T, keyof S>, never>) | null,
): {
	controls: SequenceControls | undefined;
	values: T;
} => {
	const env = useRemotionEnvironment();
	const earlyReturn = useMemo(() => {
		if (!env.isStudio || env.isReadOnlyStudio) {
			return {
				controls: undefined,
				values: (currentValue ?? {}) as T,
			};
		}

		return undefined;
	}, [env.isStudio, env.isReadOnlyStudio, currentValue]);

	if (earlyReturn) {
		return earlyReturn;
	}

	// Intentional conditional hook call, useRemotionEnvironment is stable.
	const [overrideId] = useState(() => String(Math.random()));
	const {
		visualModeEnabled,
		dragOverrides: overrides,
		codeValues,
	} = useContext(VisualModeOverridesContext);

	const controls = useMemo(() => {
		if (!visualModeEnabled) {
			return undefined;
		}

		if (schema === null || currentValue === null) {
			return undefined;
		}

		return {
			schema,
			currentValue,
			overrideId,
		};
	}, [schema, currentValue, overrideId, visualModeEnabled]);

	return useMemo(() => {
		if (
			controls === undefined ||
			currentValue === null ||
			schema === null ||
			!visualModeEnabled
		) {
			return {
				controls: undefined,
				values: (currentValue ?? {}) as T,
			};
		}

		const overrideValues = overrides[overrideId] ?? {};
		const propStatus = codeValues[overrideId];

		const currentValueKeys = Object.keys(currentValue);

		const keysToUpdate = new Set(currentValueKeys).values();

		const merged = {} as Record<string, unknown>;

		// Apply code values over runtime values, falling back to schema default
		for (const key of keysToUpdate) {
			const codeValueStatus = propStatus?.[key] ?? null;

			merged[key] = getEffectiveVisualModeValue({
				codeValue: codeValueStatus,
				runtimeValue: currentValue[key as keyof SchemaKeysRecord<S>] as unknown,
				dragOverrideValue: overrideValues[key],
				defaultValue: schema[key]?.default,
			});
		}

		return {
			controls,
			values: merged as T,
		};
	}, [
		controls,
		currentValue,
		overrideId,
		overrides,
		codeValues,
		schema,
		visualModeEnabled,
	]);
};
