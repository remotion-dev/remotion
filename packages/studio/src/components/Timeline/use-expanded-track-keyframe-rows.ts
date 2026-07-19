import {canEditEasingForInterpolationFunction} from '@remotion/studio-shared';
import {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getTreeRowHeight,
} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {getNodeHasKeyframes, getNodeKeyframes} from './get-node-keyframes';
import type {getTimelineKeyframes} from './get-timeline-keyframes';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {useTimelineSelection} from './TimelineSelection';

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
	const {selectedItems} = useTimelineSelection();
	const timelinePosition = Internals.Timeline.useTimelinePosition();

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				propStatuses,
				includeTextContent: false,
			}),
		[
			propStatuses,
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo,
			sequence,
		],
	);

	const selectedRowKeys = useMemo(
		() => getSelectedTimelineExpandedRowKeys(selectedItems),
		[selectedItems],
	);

	const filteredTree = useMemo(
		() =>
			filterTimelineExpandedTree({
				nodes: tree,
				shouldShowNode: (node) =>
					isTimelineExpandedNodeSelected({
						nodePathInfo: node.nodePathInfo,
						selectedRowKeys,
					}) ||
					getNodeHasKeyframes({
						node,
						nodePath: nodePathInfo.sequenceSubscriptionKey,
						propStatuses,
						getDragOverrides,
						getEffectDragOverrides,
					}),
			}),
		[
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo.sequenceSubscriptionKey,
			propStatuses,
			selectedRowKeys,
			tree,
		],
	);

	const flat = useMemo(
		() => flattenVisibleTreeNodes({nodes: filteredTree, getIsExpanded}),
		[filteredTree, getIsExpanded],
	);

	const expandedHeight = useMemo(() => {
		const totalRowsHeight = flat.reduce(
			(sum, {node}) => sum + getTreeRowHeight(node),
			0,
		);
		const separators = Math.max(0, flat.length - 1);
		return totalRowsHeight + separators;
	}, [flat]);

	const nodeKeyframes = useMemo(
		() =>
			new Map(
				flat.map(({node}) => [
					timelineNodePathInfoToKey(node.nodePathInfo),
					getNodeKeyframes({
						node,
						nodePath: nodePathInfo.sequenceSubscriptionKey,
						propStatuses,
						keyframeDisplayOffset,
						getDragOverrides,
						getEffectDragOverrides,
						timelinePosition,
					}),
				]),
			),
		[
			flat,
			getDragOverrides,
			getEffectDragOverrides,
			keyframeDisplayOffset,
			nodePathInfo.sequenceSubscriptionKey,
			propStatuses,
			timelinePosition,
		],
	);

	const rows = useMemo(
		(): ExpandedTrackKeyframeRow[] =>
			flat.map(({node}) => {
				const rowKey = timelineNodePathInfoToKey(node.nodePathInfo);
				return {
					height: getTreeRowHeight(node),
					keyframes: nodeKeyframes.get(rowKey) ?? [],
					canEditEasing: getNodeCanEditEasing({
						node,
						nodePath: nodePathInfo.sequenceSubscriptionKey,
						propStatuses,
					}),
					rowKey,
					nodePathInfo: node.nodePathInfo,
				};
			}),
		[propStatuses, flat, nodePathInfo.sequenceSubscriptionKey, nodeKeyframes],
	);

	return {rows, expandedHeight};
};
