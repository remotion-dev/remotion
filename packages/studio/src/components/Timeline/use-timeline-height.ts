import {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import {Internals, type PropStatuses} from 'remotion';
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

const emptyDragOverrideSnapshot = {};
const getDragOverrideSnapshot = (overrides: Record<string, unknown>): object =>
	Object.keys(overrides).length === 0 ? emptyDragOverrideSnapshot : overrides;

type HeightTrackCache = {
	readonly track: TimelineTrackData;
	readonly expanded: boolean;
	readonly runtimeValues: Readonly<Record<string, unknown>> | null;
	readonly dragOverride: object | null;
	readonly effectOverrides: readonly object[];
	readonly height: number;
};

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

	const previousHeightsRef = useRef<{
		readonly timeline: readonly TimelineTrackData[];
		readonly entries: readonly HeightTrackCache[];
		readonly expandedEntries: readonly HeightTrackCache[];
		readonly heights: readonly number[];
		readonly propStatuses: PropStatuses;
		readonly selectedRowKeys: ReadonlySet<string>;
		readonly getIsExpanded: typeof getIsExpanded;
		readonly previewServerConnected: boolean;
		readonly runtimeValuesByStore: typeof runtimeValuesByStore;
	} | null>(null);
	const result = useMemo(() => {
		const previous = previousHeightsRef.current;
		if (
			previous !== null &&
			previous.timeline === timeline &&
			previous.propStatuses === propStatuses &&
			previous.selectedRowKeys === selectedRowKeys &&
			previous.getIsExpanded === getIsExpanded &&
			previous.previewServerConnected === previewServerConnected &&
			previous.runtimeValuesByStore === runtimeValuesByStore &&
			previous.expandedEntries.every((entry) => {
				const nodePath = entry.track.nodePathInfo?.sequenceSubscriptionKey;
				if (nodePath === undefined) {
					return false;
				}

				return (
					entry.dragOverride ===
						getDragOverrideSnapshot(getDragOverrides(nodePath)) &&
					entry.effectOverrides.every(
						(value, index) =>
							value ===
							getDragOverrideSnapshot(getEffectDragOverrides(nodePath, index)),
					)
				);
			})
		) {
			return previous;
		}

		const invalidateExpanded =
			previous === null ||
			previous.propStatuses !== propStatuses ||
			previous.selectedRowKeys !== selectedRowKeys ||
			previous.getIsExpanded !== getIsExpanded;
		const entries = timeline.map((track, index): HeightTrackCache => {
			const isExpanded =
				previewServerConnected &&
				track.nodePathInfo !== null &&
				getIsExpanded(track.nodePathInfo);
			const nodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;
			const runtimeValues =
				isExpanded && track.sequence.controls
					? (runtimeValuesByStore.get(track.sequence.controls.runtimeValues) ??
						null)
					: null;
			let dragOverride: object | null = null;
			if (isExpanded && nodePath !== null) {
				dragOverride = getDragOverrideSnapshot(getDragOverrides(nodePath));
			}

			const effectOverrides =
				isExpanded && nodePath !== null
					? track.sequence.effects.map((_, effectIndex) =>
							getDragOverrideSnapshot(
								getEffectDragOverrides(nodePath, effectIndex),
							),
						)
					: [];
			const old = previous?.entries[index];
			if (
				old?.track === track &&
				old.expanded === isExpanded &&
				(!isExpanded ||
					(!invalidateExpanded &&
						old.runtimeValues === runtimeValues &&
						old.dragOverride === dragOverride &&
						old.effectOverrides.length === effectOverrides.length &&
						old.effectOverrides.every(
							(value, effectIndex) => value === effectOverrides[effectIndex],
						)))
			) {
				return old;
			}

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
					runtimeValues,
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
			return {
				track,
				expanded: isExpanded,
				runtimeValues,
				dragOverride,
				effectOverrides,
				height: layerHeight + expandedHeight,
			};
		});
		const expandedEntries = entries.filter((entry) => entry.expanded);
		const heights = entries.map((entry) => entry.height);
		const stableHeights =
			previous !== null &&
			previous.heights.length === heights.length &&
			heights.every((height, index) => previous.heights[index] === height)
				? previous.heights
				: heights;
		return {
			timeline,
			entries,
			expandedEntries,
			heights: stableHeights,
			propStatuses,
			selectedRowKeys,
			getIsExpanded,
			previewServerConnected,
			runtimeValuesByStore,
		};
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
	useLayoutEffect(() => {
		previousHeightsRef.current = result;
	}, [result]);

	return result.heights;
};
