import {useContext, useRef} from 'react';
import type {CodeValues} from '../internals.js';
import {OverrideIdsToNodePathsGettersContext} from '../sequence-node-path.js';
import {
	makeSequencePropsSubscriptionKey,
	type SequencePropsSubscriptionKey,
} from '../SequenceManager.js';
import {
	VisualModeCodeValuesContext,
	VisualModeDragOverridesContext,
} from '../SequenceManager.js';
import type {
	EffectDefinition,
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
		if (status.canUpdate) {
			out[key] = status.codeValue;
			hasAny = true;
		}
	}

	return hasAny ? out : null;
};

export const useMemoizedEffectDefinitions = (
	effects: readonly EffectDescriptor<unknown>[],
): readonly EffectDefinition<unknown>[] => {
	const previousRef = useRef<readonly EffectDefinition<unknown>[] | null>(null);

	const definitions = effects.map((descriptor) => descriptor.definition);

	const previous = previousRef.current;
	const isSame =
		previous !== null &&
		previous.length === definitions.length &&
		previous.every((def, i) => def === definitions[i]);

	if (isSame) {
		return previous;
	}

	previousRef.current = definitions;
	return definitions;
};

export const getEffectCodeValuesCtx = ({
	codeValues,
	nodePath,
	effectIndex,
}: {
	codeValues: CodeValues;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
}) => {
	const status = codeValues[makeSequencePropsSubscriptionKey(nodePath)];
	if (!status || !status.canUpdate) {
		return undefined;
	}

	const effect = status.effects.find((e) => e.effectIndex === effectIndex);
	if (!effect || !effect.canUpdate) {
		return undefined;
	}

	return effect.props;
};

export const getCodeValuesCtx = (
	codeValues: CodeValues,
	nodePath: SequencePropsSubscriptionKey,
) => {
	const status = codeValues[makeSequencePropsSubscriptionKey(nodePath)];
	if (!status) {
		return undefined;
	}

	if (!status.canUpdate) {
		return undefined;
	}

	return status.props;
};

export type GetCodeValuesType = typeof getCodeValuesCtx;

export const useMemoizedEffects = ({
	effects,
	overrideId,
}: {
	effects: readonly EffectDescriptor<unknown>[];
	readonly overrideId: string | null;
}): EffectDefinitionAndStack<unknown>[] => {
	const previousRef = useRef<EffectDefinitionAndStack<unknown>[] | null>(null);

	const {codeValues} = useContext(VisualModeCodeValuesContext);
	const {getEffectDragOverrides} = useContext(VisualModeDragOverridesContext);

	const {overrideIdToNodePathMappings} = useContext(
		OverrideIdsToNodePathsGettersContext,
	);

	const previous = previousRef.current;

	const nodePath = overrideId
		? (overrideIdToNodePathMappings[overrideId] ?? null)
		: null;

	const resolved = effects.map((descriptor, index) => {
		if (nodePath === null) {
			return {
				descriptor,
				params: descriptor.params,
				effectKey: descriptor.effectKey,
			};
		}

		const propStatus = getEffectCodeValuesCtx({
			codeValues,
			nodePath,
			effectIndex: index,
		});
		const codeOverrides = extractCodeOverrides(propStatus);
		const dragOverridesMap = getEffectDragOverrides(nodePath, index);
		const dragOverrides =
			Object.keys(dragOverridesMap).length === 0 ? null : dragOverridesMap;

		const {params, effectKey} = mergeOverrides({
			descriptor,
			codeOverrides,
			dragOverrides,
		});

		return {descriptor, params, effectKey};
	});

	const isSame =
		previous !== null &&
		previous.length === resolved.length &&
		previous.every(
			(p, i) =>
				p.definition === resolved[i].descriptor.definition &&
				p.effectKey === resolved[i].effectKey,
		);

	if (isSame) {
		return previous;
	}

	const next: EffectDefinitionAndStack<unknown>[] = resolved.map(
		({descriptor, params, effectKey}) => ({
			definition: descriptor.definition,
			effectKey,
			params,
			memoized: true,
		}),
	);
	previousRef.current = next;
	return next;
};
