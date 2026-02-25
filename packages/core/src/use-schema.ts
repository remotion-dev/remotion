import {useContext, useMemo, useState} from 'react';
import type {AnyZodObject} from './any-zod-type.js';
import type {SequenceControls} from './CompositionManager.js';
import {SequenceControlOverrideContext} from './SequenceManager.js';

export const useSchema = <T extends Record<string, unknown>>(
	schema: AnyZodObject | null,
	currentValue: T | null,
): {
	controls: SequenceControls | null;
	values: T;
} => {
	const [overrideId] = useState(() => String(Math.random()));
	const {overrides} = useContext(SequenceControlOverrideContext);

	return useMemo(() => {
		if (schema === null || currentValue === null) {
			return {
				controls: null,
				values: (currentValue ?? {}) as T,
			};
		}

		const overrideValues = overrides[overrideId] ?? {};
		const merged = {...currentValue} as Record<string, unknown>;
		for (const key of Object.keys(overrideValues)) {
			if (key in merged) {
				merged[key] = overrideValues[key];
			}
		}

		return {
			controls: {
				schema,
				currentValue,
				overrideId,
			},
			values: merged as T,
		};
	}, [schema, currentValue, overrides, overrideId]);
};
