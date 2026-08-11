import type {AnyZodSchema} from './zod-schema-type';
import {getZodDef, isZodV3Schema} from './zod-schema-type';

export const getZodNumberMinimum = (schema: AnyZodSchema): number => {
	const {checks} = getZodDef(schema);
	if (!checks) return -Infinity;

	if (isZodV3Schema(schema)) {
		// v3: {kind: "min", value: 0, inclusive: true}
		const minCheck = checks.find((c: {kind: string}) => c.kind === 'min');
		if (!minCheck || !minCheck.inclusive) return -Infinity;
		return minCheck.value;
	}

	// v4: check objects with _zod.def = {check: "greater_than", value: 0, inclusive: true}
	for (const c of checks) {
		const def = c._zod?.def;
		if (def?.check === 'greater_than' && def.inclusive) {
			return def.value;
		}
	}

	return -Infinity;
};

export const getZodNumberMaximum = (schema: AnyZodSchema): number => {
	const {checks} = getZodDef(schema);
	if (!checks) return Infinity;

	if (isZodV3Schema(schema)) {
		// v3: {kind: "max", value: 100, inclusive: true}
		const maxCheck = checks.find((c: {kind: string}) => c.kind === 'max');
		if (!maxCheck || !maxCheck.inclusive) return Infinity;
		return maxCheck.value;
	}

	// v4: check objects with _zod.def = {check: "less_than", value: 100, inclusive: true}
	for (const c of checks) {
		const def = c._zod?.def;
		if (def?.check === 'less_than' && def.inclusive) {
			return def.value;
		}
	}

	return Infinity;
};

export const getZodNumberStep = (schema: AnyZodSchema): number | undefined => {
	const {checks} = getZodDef(schema);
	if (!checks) return undefined;

	if (isZodV3Schema(schema)) {
		// v3: {kind: "multipleOf", value: 5}
		const multipleStep = checks.find(
			(c: {kind: string}) => c.kind === 'multipleOf',
		);
		if (!multipleStep) return undefined;
		return multipleStep.value;
	}

	// v4: check objects with _zod.def = {check: "multiple_of", value: 5}
	for (const c of checks) {
		const def = c._zod?.def;
		if (def?.check === 'multiple_of') {
			return def.value;
		}
	}

	return undefined;
};
