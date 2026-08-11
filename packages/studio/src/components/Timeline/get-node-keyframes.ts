import {
	Internals,
	type DragOverrideValue,
	type GetDragOverrides,
	type GetEffectDragOverrides,
	type PropStatuses,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {getTimelineKeyframes} from './get-timeline-keyframes';

const hasOverride = (
	overrides: Record<string, DragOverrideValue>,
	key: string,
): boolean => Object.prototype.hasOwnProperty.call(overrides, key);

const withDragOverrideKeyframe = ({
	propStatus,
	keyframeDisplayOffset,
	timelinePosition,
	dragOverrideValue,
	hasDragOverride,
}: {
	propStatus: Parameters<typeof getTimelineKeyframes>[0];
	keyframeDisplayOffset: number;
	timelinePosition: number;
	dragOverrideValue: DragOverrideValue | undefined;
	hasDragOverride: boolean;
}): ReturnType<typeof getTimelineKeyframes> => {
	if (dragOverrideValue?.type === 'keyframed') {
		return getTimelineKeyframes(
			dragOverrideValue.status,
			keyframeDisplayOffset,
		);
	}

	const keyframes = getTimelineKeyframes(propStatus, keyframeDisplayOffset);

	if (!hasDragOverride || propStatus?.status !== 'keyframed') {
		return keyframes;
	}

	const dragKeyframe = {
		frame: timelinePosition,
		value: dragOverrideValue?.value,
	};
	const existingIndex = keyframes.findIndex(
		(keyframe) => keyframe.frame === timelinePosition,
	);

	if (existingIndex !== -1) {
		return keyframes.map((keyframe, index) =>
			index === existingIndex ? dragKeyframe : keyframe,
		);
	}

	return [...keyframes, dragKeyframe].sort(
		(first, second) => first.frame - second.frame,
	);
};

export const getNodeKeyframes = ({
	node,
	nodePath,
	propStatuses,
	keyframeDisplayOffset,
	getDragOverrides,
	getEffectDragOverrides,
	timelinePosition,
}: {
	node: TimelineTreeNode;
	nodePath: SequencePropsSubscriptionKey;
	propStatuses: PropStatuses;
	keyframeDisplayOffset: number;
	getDragOverrides: GetDragOverrides;
	getEffectDragOverrides: GetEffectDragOverrides;
	timelinePosition: number;
}): ReturnType<typeof getTimelineKeyframes> => {
	if (node.kind !== 'field' || node.field === null) {
		return [];
	}

	if (node.field.kind === 'sequence-field') {
		const dragOverrides = getDragOverrides(nodePath);
		return withDragOverrideKeyframe({
			propStatus: Internals.getPropStatusesCtx(propStatuses, nodePath)?.[
				node.field.key
			],
			keyframeDisplayOffset,
			timelinePosition,
			dragOverrideValue: dragOverrides[node.field.key],
			hasDragOverride: hasOverride(dragOverrides, node.field.key),
		});
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex: node.field.effectIndex,
	});
	const effectDragOverrides = getEffectDragOverrides(
		nodePath,
		node.field.effectIndex,
	);

	return withDragOverrideKeyframe({
		propStatus:
			effectStatus.type === 'can-update-effect'
				? effectStatus.props?.[node.field.key]
				: null,
		keyframeDisplayOffset,
		timelinePosition,
		dragOverrideValue: effectDragOverrides[node.field.key],
		hasDragOverride: hasOverride(effectDragOverrides, node.field.key),
	});
};

export const getNodeHasKeyframes = ({
	node,
	nodePath,
	propStatuses,
	getDragOverrides,
	getEffectDragOverrides,
}: {
	node: TimelineTreeNode;
	nodePath: SequencePropsSubscriptionKey;
	propStatuses: PropStatuses;
	getDragOverrides: GetDragOverrides;
	getEffectDragOverrides: GetEffectDragOverrides;
}): boolean => {
	if (node.kind !== 'field' || node.field === null) {
		return false;
	}

	if (node.field.kind === 'sequence-field') {
		const dragOverrides = getDragOverrides(nodePath);
		if (dragOverrides[node.field.key]?.type === 'keyframed') {
			return true;
		}

		return (
			Internals.getPropStatusesCtx(propStatuses, nodePath)?.[node.field.key]
				?.status === 'keyframed'
		);
	}

	const effectDragOverrides = getEffectDragOverrides(
		nodePath,
		node.field.effectIndex,
	);
	if (effectDragOverrides[node.field.key]?.type === 'keyframed') {
		return true;
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex: node.field.effectIndex,
	});

	return (
		effectStatus.type === 'can-update-effect' &&
		effectStatus.props?.[node.field.key]?.status === 'keyframed'
	);
};
