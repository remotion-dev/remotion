import {useContext, useLayoutEffect, useRef} from 'react';
import {resolveDragOverrideValue} from '../get-effective-visual-mode-value.js';
import {interpolateKeyframedStatus} from '../interpolate-keyframed-status.js';
import {createRuntimeValueStore} from '../runtime-value-store.js';
import type {RuntimeValueStore} from '../runtime-value-store.js';
import {OverrideIdsToNodePathsGettersContext} from '../sequence-node-path.js';
import type {
	CannotUpdateEffectReason,
	CannotUpdateSequenceReason,
} from '../SequenceManager.js';
import {
	makeSequencePropsSubscriptionKey,
	VisualModeDragOverridesContext,
	VisualModePropStatusesContext,
	type SequencePropsSubscriptionKey,
} from '../SequenceManager.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {
	type CanUpdateSequencePropStatus,
	type DragOverrideValue,
	type PropStatuses,
} from '../use-schema.js';
import type {
	EffectDefinitionAndStack,
	EffectDescriptor,
	EffectDefinition,
} from './effect-types.js';

const mergeOverrides = ({
	descriptor,
	propStatusOverrides,
	dragOverrides,
	frame,
}: {
	descriptor: EffectDescriptor<unknown>;
	propStatusOverrides: Record<string, unknown> | null;
	dragOverrides: Record<string, DragOverrideValue> | null;
	frame: number;
}): {params: unknown; effectKey: string} => {
	if (!propStatusOverrides && !dragOverrides) {
		return {params: descriptor.params, effectKey: descriptor.effectKey};
	}

	const merged: Record<string, unknown> = {
		...(descriptor.params as Record<string, unknown>),
	};

	if (propStatusOverrides) {
		for (const [key, value] of Object.entries(propStatusOverrides)) {
			if (value !== undefined) {
				merged[key] = value;
			}
		}
	}

	if (dragOverrides) {
		for (const [key, value] of Object.entries(dragOverrides)) {
			const resolved = resolveDragOverrideValue({
				dragOverrideValue: value,
				frame,
			});
			if (resolved.type === 'resolved') {
				merged[key] = resolved.value;
			}
		}
	}

	return {
		params: merged,
		effectKey: descriptor.definition.calculateKey(merged),
	};
};

const resolvePropStatusOverrides = (
	propStatus: Record<string, CanUpdateSequencePropStatus> | undefined,
	frame: number,
): Record<string, unknown> | null => {
	if (!propStatus) {
		return null;
	}

	const out: Record<string, unknown> = {};
	let hasAny = false;
	for (const [key, status] of Object.entries(propStatus)) {
		if (status.status === 'static') {
			out[key] = status.codeValue;
			hasAny = true;
			continue;
		}

		if (status.status === 'keyframed') {
			const value = interpolateKeyframedStatus({
				forceSpringAllowTail: null,
				frame,
				status,
			});
			if (value !== null) {
				out[key] = value;
				hasAny = true;
			}
		}
	}

	return hasAny ? out : null;
};

export const useMemoizedEffectDefinitions = (
	effects: readonly EffectDescriptor<unknown>[],
): readonly EffectDefinition<unknown>[] & {
	readonly runtimeValues: readonly RuntimeValueStore[];
} => {
	const previousRef = useRef<{
		readonly definitions: readonly EffectDefinition<unknown>[];
		readonly controllers: ReturnType<typeof createRuntimeValueStore>[];
	} | null>(null);

	const definitions = effects.map((descriptor) => descriptor.definition);

	const previous = previousRef.current;
	const isSame =
		previous !== null &&
		previous.definitions.length === definitions.length &&
		previous.definitions.every(
			(definition, i) => definition === definitions[i],
		);
	const controllers = isSame
		? previous.controllers
		: effects.map((effect) =>
				createRuntimeValueStore(effect.params as Record<string, unknown>),
			);
	const stableDefinitions = isSame ? previous.definitions : definitions;

	useLayoutEffect(() => {
		// Stores are intentionally updated without changing the registered effect
		// array, so frame-dependent parameters don't re-register the Sequence.
		stableDefinitions.forEach((_definition, index) => {
			const snapshot = effects[index]?.params as Record<string, unknown>;
			controllers[index].setSnapshot(snapshot);
		});
	}, [controllers, effects, stableDefinitions]);

	previousRef.current = {definitions: stableDefinitions, controllers};
	return Object.assign(stableDefinitions, {
		runtimeValues: controllers.map((controller) => controller.store),
	});
};

type EffectStatus =
	| {
			type: 'cannot-update-sequence';
			reason: CannotUpdateSequenceReason;
	  }
	| {
			type: 'cannot-update-effect';
			reason: CannotUpdateEffectReason;
	  }
	| {
			type: 'can-update-effect';
			props: Record<string, CanUpdateSequencePropStatus>;
	  };

export const getEffectPropStatusesCtx = ({
	propStatuses,
	nodePath,
	effectIndex,
}: {
	propStatuses: PropStatuses;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
}): EffectStatus => {
	const status = propStatuses[makeSequencePropsSubscriptionKey(nodePath)];
	if (!status) {
		return {type: 'cannot-update-sequence', reason: 'not-found'};
	}

	if (!status.canUpdate) {
		return {type: 'cannot-update-sequence', reason: status.reason};
	}

	const effect = status.effects.find((e) => e.effectIndex === effectIndex);
	if (!effect) {
		return {type: 'cannot-update-effect', reason: 'not-found'};
	}

	if (!effect.canUpdate) {
		return {type: 'cannot-update-effect', reason: effect.reason};
	}

	return {type: 'can-update-effect', props: effect.props};
};

export const getPropStatusesCtx = (
	propStatuses: PropStatuses,
	nodePath: SequencePropsSubscriptionKey,
) => {
	const status = propStatuses[makeSequencePropsSubscriptionKey(nodePath)];
	if (!status) {
		return undefined;
	}

	if (!status.canUpdate) {
		return undefined;
	}

	return status.props;
};

export type GetPropStatusesType = typeof getPropStatusesCtx;

export const useMemoizedEffects = ({
	effects,
	overrideId,
}: {
	effects: readonly EffectDescriptor<unknown>[];
	readonly overrideId: string | null;
}): EffectDefinitionAndStack<unknown>[] => {
	const previousRef = useRef<EffectDefinitionAndStack<unknown>[] | null>(null);

	const {propStatuses} = useContext(VisualModePropStatusesContext);
	const {getEffectDragOverrides} = useContext(VisualModeDragOverridesContext);
	const frame = useCurrentFrame();

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

		const effectStatus = getEffectPropStatusesCtx({
			propStatuses,
			nodePath,
			effectIndex: index,
		});
		const propStatusOverrides =
			effectStatus.type === 'can-update-effect'
				? resolvePropStatusOverrides(effectStatus.props, frame)
				: null;
		const dragOverridesMap = getEffectDragOverrides(nodePath, index);
		const dragOverrides =
			Object.keys(dragOverridesMap).length === 0 ? null : dragOverridesMap;

		const {params, effectKey} = mergeOverrides({
			descriptor,
			propStatusOverrides,
			dragOverrides,
			frame,
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
