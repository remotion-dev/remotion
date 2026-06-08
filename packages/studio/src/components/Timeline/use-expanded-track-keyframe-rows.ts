import {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getExpandedTrackHeight,
	getTreeRowHeight,
} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {getNodeKeyframes} from './get-node-keyframes';
import type {getTimelineKeyframes} from './get-timeline-keyframes';

const canEditEasingForInterpolationFunction = (
	interpolationFunction: string,
): boolean =>
	interpolationFunction === 'interpolate' ||
	interpolationFunction === 'interpolateColors';

export type ExpandedTrackKeyframeRow = {
	readonly height: number;
	readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
	readonly canEditEasing: boolean;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly rowKey: string;
};

const getNodeCanEditEasing = ({
	node,
	nodePath,
	propStatuses,
}: {
	node: ReturnType<typeof flattenVisibleTreeNodes>[number]['node'];
	nodePath: Parameters<typeof getNodeKeyframes>[0]['nodePath'];
	propStatuses: Parameters<typeof getNodeKeyframes>[0]['propStatuses'];
}) => {
	if (node.kind !== 'field' || node.field === null) {
		return false;
	}

	if (node.field.kind === 'sequence-field') {
		const sequencePropStatus = Internals.getPropStatusesCtx(
			propStatuses,
			nodePath,
		)?.[node.field.key];
		return (
			sequencePropStatus?.status === 'keyframed' &&
			canEditEasingForInterpolationFunction(
				sequencePropStatus.interpolationFunction,
			)
		);
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex: node.field.effectIndex,
	});
	const effectPropStatus =
		effectStatus.type === 'can-update-effect'
			? effectStatus.props[node.field.key]
			: null;
	return (
		effectPropStatus?.status === 'keyframed' &&
		canEditEasingForInterpolationFunction(
			effectPropStatus.interpolationFunction,
		)
	);
};

export const useExpandedTrackKeyframeRows = ({
	sequence,
	nodePathInfo,
	keyframeDisplayOffset,
}: {
	sequence: TSequence;
	nodePathInfo: SequenceNodePathInfo;
	keyframeDisplayOffset: number;
}): {
	readonly rows: ExpandedTrackKeyframeRow[];
	readonly expandedHeight: number;
} => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const timelinePosition = Internals.Timeline.useTimelinePosition();

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				propStatuses,
			}),
		[
			propStatuses,
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo,
			sequence,
		],
	);

	const flat = useMemo(
		() => flattenVisibleTreeNodes({nodes: tree, getIsExpanded}),
		[tree, getIsExpanded],
	);

	const expandedHeight = useMemo(
		() =>
			getExpandedTrackHeight({
				sequence,
				nodePathInfo,
				getIsExpanded,
				propStatuses,
			}),
		[propStatuses, getIsExpanded, nodePathInfo, sequence],
	);

	const rows = useMemo(
		(): ExpandedTrackKeyframeRow[] =>
			flat.map(({node}) => ({
				height: getTreeRowHeight(node),
				keyframes: getNodeKeyframes({
					node,
					nodePath: nodePathInfo.sequenceSubscriptionKey,
					propStatuses,
					keyframeDisplayOffset,
					getDragOverrides,
					getEffectDragOverrides,
					timelinePosition,
				}),
				canEditEasing: getNodeCanEditEasing({
					node,
					nodePath: nodePathInfo.sequenceSubscriptionKey,
					propStatuses,
				}),
				rowKey: timelineNodePathInfoToKey(node.nodePathInfo),
				nodePathInfo: node.nodePathInfo,
			})),
		[
			propStatuses,
			flat,
			getDragOverrides,
			getEffectDragOverrides,
			keyframeDisplayOffset,
			nodePathInfo.sequenceSubscriptionKey,
			timelinePosition,
		],
	);

	return {rows, expandedHeight};
};
