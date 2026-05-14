import {useContext, useRef} from 'react';
import {
	VisualModeCodeValuesContext,
	VisualModeDragOverridesContext,
} from '../SequenceManager.js';
import {EffectOverridesContext} from './effect-overrides-context.js';
import type {
	EffectDefinitionAndStack,
	EffectDescriptor,
} from './effect-types.js';

const mergeOverrides = ({
	descriptor,
	codeOverrides,
	dragOverrides,
}: {
	descriptor: EffectDescriptor<unknown>;
	codeOverrides: Record<string, unknown> | null;
	dragOverrides: Record<string, unknown> | null;
}): {params: unknown; effectKey: string} => {
	if (!codeOverrides && !dragOverrides) {
		return {params: descriptor.params, effectKey: descriptor.effectKey};
	}

	const merged: Record<string, unknown> = {
		...(descriptor.params as Record<string, unknown>),
	};

	if (codeOverrides) {
		for (const [key, value] of Object.entries(codeOverrides)) {
			if (value !== undefined) {
				merged[key] = value;
			}
		}
	}

	if (dragOverrides) {
		for (const [key, value] of Object.entries(dragOverrides)) {
			merged[key] = value;
		}
	}

	return {
		params: merged,
		effectKey: descriptor.definition.calculateKey(merged),
	};
};

const extractCodeOverrides = (
	propStatus:
		| Record<string, {canUpdate: boolean; codeValue?: unknown}>
		| undefined,
): Record<string, unknown> | null => {
	if (!propStatus) {
		return null;
	}

	const out: Record<string, unknown> = {};
	let hasAny = false;
	for (const [key, status] of Object.entries(propStatus)) {
		if (status.canUpdate && 'codeValue' in status) {
			out[key] = status.codeValue;
			hasAny = true;
		}
	}

	return hasAny ? out : null;
};

export const useMemoizedEffects = (
	effects: EffectDescriptor<unknown>[],
): EffectDefinitionAndStack<unknown>[] => {
	const previousRef = useRef<EffectDefinitionAndStack<unknown>[] | null>(null);

	const {nodePath} = useContext(EffectOverridesContext);
	const {getEffectCodeValues} = useContext(VisualModeCodeValuesContext);
	const {getEffectDragOverrides} = useContext(VisualModeDragOverridesContext);

	const resolved = effects.map((descriptor) => {
		if (nodePath === null) {
			return {
				descriptor,
				params: descriptor.params,
				effectKey: descriptor.effectKey,
			};
		}

		const propStatus = getEffectCodeValues(nodePath, descriptor.sourceIndex);
		const codeOverrides = extractCodeOverrides(propStatus);
		const dragOverridesMap = getEffectDragOverrides(
			nodePath,
			descriptor.sourceIndex,
		);
		const dragOverrides =
			Object.keys(dragOverridesMap).length === 0 ? null : dragOverridesMap;

		const {params, effectKey} = mergeOverrides({
			descriptor,
			codeOverrides,
			dragOverrides,
		});

		return {descriptor, params, effectKey};
	});

	const previous = previousRef.current;
	const isSame =
		previous !== null &&
		previous.length === resolved.length &&
		previous.every(
			(p, i) =>
				p.definition === resolved[i].descriptor.definition &&
				p.effectKey === resolved[i].effectKey &&
				p.sourceIndex === resolved[i].descriptor.sourceIndex,
		);

	if (isSame) {
		return previous;
	}

	const next: EffectDefinitionAndStack<unknown>[] = resolved.map(
		({descriptor, params, effectKey}) => ({
			definition: descriptor.definition,
			stack: descriptor.stack,
			effectKey,
			params,
			sourceIndex: descriptor.sourceIndex,
			memoized: true,
		}),
	);
	previousRef.current = next;
	return next;
};
