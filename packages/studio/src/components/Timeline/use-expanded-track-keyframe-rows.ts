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

export type ExpandedTrackKeyframeRow = {
	readonly height: number;
	readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly rowKey: string;
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
