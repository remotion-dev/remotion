import {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {buildTimelineTree} from '../../helpers/timeline-layout';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import {getNodeHasKeyframes} from './get-node-keyframes';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {useTimelineSelection} from './TimelineSelection';

export const useTimelineExpandedTree = ({
	sequence,
	nodePathInfo,
	includeTextContent,
	includeSourceControls,
}: {
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly includeTextContent: boolean;
	readonly includeSourceControls: boolean;
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

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				propStatuses: visualModePropStatuses,
				includeTextContent,
				includeSourceControls,
			}),
		[
			sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			visualModePropStatuses,
			includeTextContent,
			includeSourceControls,
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
						propStatuses: visualModePropStatuses,
						getDragOverrides,
						getEffectDragOverrides,
					}),
			}),
		[
			getDragOverrides,
			getEffectDragOverrides,
			nodePathInfo.sequenceSubscriptionKey,
			selectedRowKeys,
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
