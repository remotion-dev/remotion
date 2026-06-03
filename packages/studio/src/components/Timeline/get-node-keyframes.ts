import {
	Internals,
	type CodeValues,
	type GetDragOverrides,
	type GetEffectDragOverrides,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {getTimelineKeyframes} from './get-timeline-keyframes';

const hasOverride = (
	overrides: Record<string, unknown>,
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
	dragOverrideValue: unknown;
	hasDragOverride: boolean;
}): ReturnType<typeof getTimelineKeyframes> => {
	const keyframes = getTimelineKeyframes(propStatus, keyframeDisplayOffset);

	if (!hasDragOverride || propStatus?.status !== 'keyframed') {
		return keyframes;
	}

	const dragKeyframe = {frame: timelinePosition, value: dragOverrideValue};
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
	codeValues,
	keyframeDisplayOffset,
	getDragOverrides,
	getEffectDragOverrides,
	timelinePosition,
}: {
	node: TimelineTreeNode;
	nodePath: SequencePropsSubscriptionKey;
	codeValues: CodeValues;
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
			propStatus: Internals.getCodeValuesCtx(codeValues, nodePath)?.[
				node.field.key
			],
			keyframeDisplayOffset,
			timelinePosition,
			dragOverrideValue: dragOverrides[node.field.key],
			hasDragOverride: hasOverride(dragOverrides, node.field.key),
		});
	}

	const effectStatus = Internals.getEffectCodeValuesCtx({
		codeValues,
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
