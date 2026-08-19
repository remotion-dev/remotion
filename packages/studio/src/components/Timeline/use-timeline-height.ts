import {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getTimelineLayerHeight,
	getTreeRowHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {useRuntimeValueSnapshots} from '../../helpers/use-runtime-values';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {getNodeHasKeyframes} from './get-node-keyframes';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {useTimelineSelection} from './TimelineSelection';

export const useTimelineTrackHeights = ({
	timeline,
}: {
	timeline: readonly TimelineTrackData[];
}): readonly number[] => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {selectedItems} = useTimelineSelection();

	const previewServerConnected = previewServerState.type === 'connected';
	const selectedRowKeys = useMemo(
		() => getSelectedTimelineExpandedRowKeys(selectedItems),
		[selectedItems],
	);
	const expandedControls = useMemo(
		() =>
			timeline.flatMap((track) => {
				if (
					!previewServerConnected ||
					track.nodePathInfo === null ||
					!getIsExpanded(track.nodePathInfo) ||
					track.sequence.controls === null
				) {
					return [];
				}

				return [track.sequence.controls];
			}),
		[getIsExpanded, previewServerConnected, timeline],
	);
	const runtimeValueSnapshots = useRuntimeValueSnapshots(expandedControls);
	const runtimeValuesByStore = useMemo(
		() =>
			new Map(
				expandedControls.map((controls, index) => [
					controls.runtimeValues,
					runtimeValueSnapshots[index],
				]),
			),
		[expandedControls, runtimeValueSnapshots],
	);

	const heights = useMemo(() => {
		return timeline.map((track) => {
			const isExpanded =
				previewServerConnected &&
				track.nodePathInfo !== null &&
				getIsExpanded(track.nodePathInfo);
			const layerHeight =
				getTimelineLayerHeight(track.sequence.type) +
				TIMELINE_ITEM_BORDER_BOTTOM;
			const expandedHeight = (() => {
				if (!isExpanded || track.nodePathInfo === null) {
					return 0;
				}

				const {nodePathInfo} = track;
				const tree = buildTimelineTree({
					sequence: track.sequence,
					nodePathInfo,
					getDragOverrides,
					getEffectDragOverrides,
					propStatuses,
					includeTextContent: false,
					includeSourceControls: false,
					runtimeValues: track.sequence.controls
						? (runtimeValuesByStore.get(
								track.sequence.controls.runtimeValues,
							) ?? null)
						: null,
				});
				const filteredTree = filterTimelineExpandedTree({
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
				});
				const flat = flattenVisibleTreeNodes({
					nodes: filteredTree,
					getIsExpanded,
				});

				if (flat.length === 0) {
					return 0;
				}

				const totalRowsHeight = flat.reduce(
					(sum, {node}) => sum + getTreeRowHeight(node),
					0,
				);
				const separators = Math.max(0, flat.length - 1);
				return totalRowsHeight + separators + TIMELINE_ITEM_BORDER_BOTTOM;
			})();
			return layerHeight + expandedHeight;
		});
	}, [
		timeline,
		previewServerConnected,
		getIsExpanded,
		propStatuses,
		getDragOverrides,
		getEffectDragOverrides,
		selectedRowKeys,
		runtimeValuesByStore,
	]);
	const stableHeights = useRef(heights);
	if (
		stableHeights.current.length !== heights.length ||
		heights.some((height, index) => stableHeights.current[index] !== height)
	) {
		stableHeights.current = heights;
	}

	return stableHeights.current;
};
