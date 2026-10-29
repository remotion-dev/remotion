import {useMemo} from 'react';
import type {InteractivitySchema, SequenceRegistrationControls} from 'remotion';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';

// Timeline tree structure depends on enum choices and array lengths, while
// animated field values are read by their editors through the runtime store.
export const useTimelineStructureSelector = <T>({
	controls,
	selector,
	isEqual,
}: {
	readonly controls: SequenceRegistrationControls | null;
	readonly selector: (values: Readonly<Record<string, unknown>>) => T;
	readonly isEqual: ((first: T, second: T) => boolean) | null;
}): T => {
	const schema = controls?.schema;
	const store = controls?.runtimeValues;
	const selectStructure = useMemo(() => {
		const keys = new Map<string, boolean>();
		const schemas: InteractivitySchema[] = schema ? [schema] : [];
		for (const current of schemas) {
			for (const [key, field] of Object.entries(current)) {
				if (field.type === 'enum') {
					keys.set(key, true);
					schemas.push(...Object.values(field.variants));
				} else if (field.type === 'array' && !keys.has(key)) {
					keys.set(key, false);
				}
			}
		}

		let previous: unknown[] | null = null;
		let result: T;
		return (values: Readonly<Record<string, unknown>>) => {
			const next: unknown[] = [];
			let cacheable = true;
			for (const [key, isEnum] of keys) {
				// Absent keys do not resolve source values or drag overrides.
				const present = Object.prototype.propertyIsEnumerable.call(values, key);
				next.push(present);
				if (!present) continue;
				const value = values[key];
				if (isEnum) {
					// Object-to-key coercion can change without a new reference.
					if (
						value !== null &&
						(typeof value === 'object' || typeof value === 'function')
					) {
						cacheable = false;
					}

					next.push(value);
				} else {
					// Capture length now, including arrays later mutated in place.
					next.push(Array.isArray(value) ? value.length : null);
				}
			}

			const last = previous;
			if (
				cacheable &&
				last !== null &&
				last.length === next.length &&
				next.every((value, index) => Object.is(value, last[index]))
			) {
				return result;
			}

			result = selector(values);
			previous = cacheable ? next : null;
			return result;
		};
		// Tree nodes hold runtime-store references, so a new store must reset the cache.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [schema, store, selector]);

	return useRuntimeValueSelector({
		controls,
		selector: selectStructure,
		isEqual: isEqual ?? Object.is,
	});
};
