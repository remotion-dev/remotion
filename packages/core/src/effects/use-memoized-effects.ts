import React, {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {evaluateSourcePropStatuses} from '../evaluate-source-expressions.js';
import {
	getFrameInKeyframedStatusClock,
	resolveDragOverrideValue,
} from '../get-effective-visual-mode-value.js';
import {interpolateKeyframedStatus} from '../interpolate-keyframed-status.js';
import {areRegistryEntriesEqual} from '../registry-store.js';
import {createRuntimeValueStore} from '../runtime-value-store.js';
import type {RuntimeValueStore} from '../runtime-value-store.js';
import {SequenceActivityDormantContext} from '../sequence-activity-context.js';
import {OverrideIdsToNodePathsGettersContext} from '../sequence-node-path.js';
import type {
	CannotUpdateEffectReason,
	CannotUpdateSequenceReason,
	CanUpdateSequencePropsResponse,
} from '../SequenceManager.js';
import {
	makeSequencePropsSubscriptionKey,
	useEffectDragOverridesForNodePath,
	usePropStatusForNodePath,
	type SequencePropsSubscriptionKey,
} from '../SequenceManager.js';
import {useCurrentFrameWithOptionalSubscription} from '../use-current-frame.js';
import {
	type CanUpdateSequencePropStatus,
	type DragOverrideValue,
	type PropStatuses,
} from '../use-schema.js';
import type {VideoConfigValues} from '../video-config.js';
import type {
	EffectDefinitionAndStack,
	EffectDescriptor,
	EffectDefinition,
} from './effect-types.js';

const emptyDragOverrides: Record<string, DragOverrideValue> = {};
const useCacheCommitEffect = React.useInsertionEffect ?? useLayoutEffect;

const areEffectParamsEqual = (previous: unknown, next: unknown): boolean => {
	if (Object.is(previous, next)) {
		return true;
	}

	if (
		previous === null ||
		next === null ||
		typeof previous !== 'object' ||
		typeof next !== 'object' ||
		Object.getPrototypeOf(previous) !== Object.prototype ||
		Object.getPrototypeOf(next) !== Object.prototype
	) {
		return false;
	}

	return areRegistryEntriesEqual(previous, next);
};

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
				frame: getFrameInKeyframedStatusClock({frame, status}),
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
	const activityDormant = useContext(SequenceActivityDormantContext);
	const previousRef = useRef<{
		readonly definitions: readonly EffectDefinition<unknown>[] & {
			readonly runtimeValues: readonly RuntimeValueStore[];
		};
		readonly controllers: ReturnType<typeof createRuntimeValueStore>[];
	} | null>(null);

	const previous = previousRef.current;
	const isSame =
		previous !== null &&
		previous.definitions.length === effects.length &&
		previous.definitions.every(
			(definition, i) => definition === effects[i].definition,
		);
	const controllers = isSame
		? previous.controllers
		: effects.map((effect) =>
				createRuntimeValueStore(effect.params as Record<string, unknown>),
			);
	const stableDefinitions = isSame
		? previous.definitions
		: Object.assign(
				effects.map((descriptor) => descriptor.definition),
				{
					runtimeValues: controllers.map((controller) => controller.store),
				},
			);

	useCacheCommitEffect(() => {
		// Insertion effects also run for hidden Activity commits. Store listeners
		// must run after React finishes committing, never inside an insertion effect.
		previousRef.current = {definitions: stableDefinitions, controllers};
		if (!activityDormant || controllers.length === 0) {
			return;
		}

		if (
			controllers.every((controller, index) =>
				areEffectParamsEqual(
					controller.store.getSnapshot(),
					effects[index]?.params,
				),
			)
		) {
			return;
		}

		let cancelled = false;
		queueMicrotask(() => {
			if (cancelled) {
				return;
			}

			controllers.forEach((controller, index) => {
				const snapshot = effects[index]?.params as Record<string, unknown>;
				const currentSnapshot = controller.store.getSnapshot();
				// Equivalent inline params should not notify inspector subscribers on
				// every dormant render. Preserve changes to keys and leaf references.
				if (areEffectParamsEqual(snapshot, currentSnapshot)) {
					return;
				}

				controller.setSnapshot(snapshot);
			});
		});
		return () => {
			// A newer commit or unmount supersedes this pending publication.
			cancelled = true;
		};
	}, [activityDormant, controllers, effects, stableDefinitions]);
	useLayoutEffect(() => {
		// Stores are intentionally updated without changing the registered effect
		// array, so frame-dependent parameters don't re-register the Sequence.
		stableDefinitions.forEach((_definition, index) => {
			const snapshot = effects[index]?.params as Record<string, unknown>;
			if (
				!areEffectParamsEqual(controllers[index].store.getSnapshot(), snapshot)
			) {
				controllers[index].setSnapshot(snapshot);
			}
		});
	}, [controllers, effects, stableDefinitions]);

	return stableDefinitions;
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

const getEffectStatusForSequenceStatus = ({
	status,
	effectIndex,
	videoConfigValues,
}: {
	status: CanUpdateSequencePropsResponse | null;
	effectIndex: number;
	videoConfigValues: VideoConfigValues | null;
}): EffectStatus => {
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

	return {
		type: 'can-update-effect',
		props: evaluateSourcePropStatuses(effect.props, videoConfigValues),
	};
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
	return getEffectStatusForSequenceStatus({
		status: propStatuses[makeSequencePropsSubscriptionKey(nodePath)] ?? null,
		effectIndex,
		videoConfigValues: nodePath.videoConfigValues,
	});
};

export const getPropStatusesForSequenceStatus = (
	status: CanUpdateSequencePropsResponse | null,
	videoConfigValues: VideoConfigValues | null,
) => {
	if (!status) {
		return undefined;
	}

	if (!status.canUpdate) {
		return undefined;
	}

	return evaluateSourcePropStatuses(status.props, videoConfigValues);
};

export const getPropStatusesCtx = (
	propStatuses: PropStatuses,
	nodePath: SequencePropsSubscriptionKey,
) => {
	return getPropStatusesForSequenceStatus(
		propStatuses[makeSequencePropsSubscriptionKey(nodePath)] ?? null,
		nodePath.videoConfigValues,
	);
};

export type GetPropStatusesType = typeof getPropStatusesCtx;

type PreparedEffect = {
	readonly definition: EffectDefinition<unknown>;
	readonly sourceKey: string;
	readonly params: unknown;
	readonly propStatus: Record<string, CanUpdateSequencePropStatus> | null;
	readonly dragOverrides: Record<string, DragOverrideValue> | null;
	readonly frame: number | null;
	readonly value: EffectDefinitionAndStack<unknown>;
};

export const useMemoizedEffects = ({
	effects,
	overrideId,
	videoConfigValues,
}: {
	effects: readonly EffectDescriptor<unknown>[];
	readonly overrideId: string | null;
	videoConfigValues: VideoConfigValues | null;
}): EffectDefinitionAndStack<unknown>[] => {
	const previousRef = useRef<{
		readonly prepared: PreparedEffect[];
		readonly effects: EffectDefinitionAndStack<unknown>[];
	} | null>(null);

	const {overrideIdToNodePathMappings} = useContext(
		OverrideIdsToNodePathsGettersContext,
	);

	const previous = previousRef.current;

	const nodePath = overrideId
		? (overrideIdToNodePathMappings[overrideId] ?? null)
		: null;
	const effectDragOverrides = useEffectDragOverridesForNodePath(nodePath);
	const sequenceStatus = usePropStatusForNodePath(nodePath);

	const effectPropStatuses = useMemo(
		() =>
			Array.from({length: effects.length}, (_, effectIndex) => {
				if (nodePath === null) {
					return null;
				}

				const status = getEffectStatusForSequenceStatus({
					status: sequenceStatus,
					effectIndex,
					videoConfigValues,
				});
				return status.type === 'can-update-effect' ? status.props : null;
			}),
		[effects.length, nodePath, sequenceStatus, videoConfigValues],
	);
	const animatedEffects = useMemo(
		() =>
			effectPropStatuses.map(
				(status, index) =>
					Object.values(status ?? {}).some(
						(prop) => prop.status === 'keyframed',
					) ||
					Object.values(effectDragOverrides[index] ?? emptyDragOverrides).some(
						(override) => override.type === 'keyframed',
					),
			),
		[effectDragOverrides, effectPropStatuses],
	);
	// Runtime animations arrive through props. Only source/drag keyframes need
	// their own clock, and an animated effect must not invalidate static siblings.
	const frame = useCurrentFrameWithOptionalSubscription(
		animatedEffects.some(Boolean),
	);

	const prepared = effects.map((descriptor, index): PreparedEffect => {
		const propStatus = effectPropStatuses[index];
		const dragOverridesMap = effectDragOverrides[index] ?? emptyDragOverrides;
		const dragOverrides =
			Object.keys(dragOverridesMap).length === 0 ? null : dragOverridesMap;
		const effectFrame = animatedEffects[index] ? frame : null;
		const cached = previous?.prepared[index];
		if (
			cached &&
			cached.definition === descriptor.definition &&
			cached.sourceKey === descriptor.effectKey &&
			areEffectParamsEqual(cached.params, descriptor.params) &&
			cached.propStatus === propStatus &&
			cached.dragOverrides === dragOverrides &&
			cached.frame === effectFrame
		) {
			return cached;
		}

		const propStatusOverrides = resolvePropStatusOverrides(
			propStatus ?? undefined,
			frame,
		);

		const {params, effectKey} = mergeOverrides({
			descriptor,
			propStatusOverrides,
			dragOverrides,
			frame,
		});

		return {
			definition: descriptor.definition,
			sourceKey: descriptor.effectKey,
			// Snapshot plain params so shallow comparisons see in-place field edits.
			params:
				descriptor.params !== null &&
				typeof descriptor.params === 'object' &&
				Object.getPrototypeOf(descriptor.params) === Object.prototype
					? {...descriptor.params}
					: descriptor.params,
			propStatus,
			dragOverrides,
			frame: effectFrame,
			value:
				cached?.value.definition === descriptor.definition &&
				cached.value.effectKey === effectKey
					? cached.value
					: {
							definition: descriptor.definition,
							effectKey,
							params,
							memoized: true,
						},
		};
	});

	const isSame =
		previous !== null &&
		previous.effects.length === prepared.length &&
		previous.effects.every((effect, i) => effect === prepared[i].value);

	const next: EffectDefinitionAndStack<unknown>[] = isSame
		? previous.effects
		: prepared.map((effect) => effect.value);
	useCacheCommitEffect(() => {
		previousRef.current = {prepared, effects: next};
	}, [next, prepared]);
	return next;
};
