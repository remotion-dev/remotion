import {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {buildTimelineTree} from '../../helpers/timeline-layout';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import {getNodeKeyframes} from './get-node-keyframes';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {useTimelineSelection} from './TimelineSelection';

export const useTimelineExpandedTree = ({
	sequence,
	nodePathInfo,
	keyframeDisplayOffset,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {propStatuses: visualModePropStatuses} = useContext(
		Internals.VisualModePropStatusesContext,
	);
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
				propStatuses: visualModePropStatuses,
			}),
		[
			sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			visualModePropStatuses,
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
					getNodeKeyframes({
						node,
						nodePath: nodePathInfo.sequenceSubscriptionKey,
						propStatuses: visualModePropStatuses,
						keyframeDisplayOffset,
						getDragOverrides,
						getEffectDragOverrides,
						timelinePosition,
					}).length > 0,
			}),
		[
			getDragOverrides,
			getEffectDragOverrides,
			keyframeDisplayOffset,
			nodePathInfo.sequenceSubscriptionKey,
			selectedRowKeys,
			timelinePosition,
			tree,
			visualModePropStatuses,
		],
	);

	return {
		filteredTree,
		getIsExpanded,
		propStatuses: visualModePropStatuses,
		toggleTrack,
		tree,
	};
};
