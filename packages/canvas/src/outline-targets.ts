import type {RefObject} from 'react';
import type {TSequence} from 'remotion';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from './get-timeline-sequence-sort-key';
import type {CanvasHover} from './hover';
import {
	getCanvasSequenceSelectionKey,
	type CanvasSelectionItem,
} from './selection';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';

export type CanvasSelectableOutline = {
	readonly depth: number;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
};

export type CanvasOutlineLayoutTarget = CanvasSelectableOutline & {
	readonly nodePathKey: string;
	readonly ref: RefObject<Element | null>;
	readonly selected: boolean;
	readonly containsSelection: boolean;
	readonly showSelectedOutline: boolean;
	readonly selection: Extract<CanvasSelectionItem, {type: 'sequence'}>;
};

export const getCanvasVisibleOutlineTargets = <
	T extends {readonly sequence: Pick<TSequence, 'from' | 'duration'>},
>({
	targets,
	timelinePosition,
}: {
	readonly targets: readonly T[];
	readonly timelinePosition: number;
}): T[] => {
	return targets.filter(
		({sequence}) =>
			timelinePosition >= sequence.from &&
			timelinePosition < sequence.from + sequence.duration,
	);
};

/** A null timeline position includes all registered, selectable instances. */
export const getCanvasSelectableOutlines = ({
	tracks,
	timelinePosition,
	resolveSequenceNodePathInfo,
}: {
	readonly tracks: readonly TimelineTrackData[];
	readonly timelinePosition: number | null;
	readonly resolveSequenceNodePathInfo: CanvasSequenceNodePathResolver | null;
}): CanvasSelectableOutline[] => {
	const selectableOutlines = tracks
		.flatMap((track, index): CanvasSelectableOutline[] => {
			const {sequence} = track;
			if (!sequence.showInTimeline || sequence.refForOutline === null) {
				return [];
			}

			const nodePathInfo =
				resolveSequenceNodePathInfo === null
					? track.nodePathInfo
					: resolveSequenceNodePathInfo(track, index);
			if (nodePathInfo === null || nodePathInfo.auxiliaryKeys.length !== 0) {
				return [];
			}

			return [
				{
					depth: track.depth,
					keyframeDisplayOffset: track.keyframeDisplayOffset,
					keyframePlaybackRate: track.keyframePlaybackRate,
					key: getCanvasSequenceSelectionKey(nodePathInfo),
					nodePathInfo,
					sequence,
				},
			];
		})
		.sort((a, b) => a.depth - b.depth);

	return timelinePosition === null
		? selectableOutlines
		: getCanvasVisibleOutlineTargets({
				targets: selectableOutlines,
				timelinePosition,
			});
};

export const getCanvasSelectedSequenceKeys = (
	selectedItems: readonly CanvasSelectionItem[],
): Set<string> => {
	return new Set(
		selectedItems
			.filter((item) => item.type === 'sequence')
			.map((item) => getCanvasSequenceSelectionKey(item.nodePathInfo)),
	);
};

export const getCanvasSequenceKeysContainingSelection = (
	selectedItems: readonly CanvasSelectionItem[],
): Set<string> => {
	return new Set(
		selectedItems
			.filter((item) => item.type !== 'guide')
			.map((item) => getCanvasSequenceSelectionKey(item.nodePathInfo)),
	);
};

/** Keeps every instance of an active source while the canvas is inactive. */
export const getCanvasActiveOutlineTargets = <
	T extends Pick<CanvasSelectableOutline, 'key' | 'nodePathInfo'>,
>({
	targets,
	selectedSequenceKeys,
	sequenceKeysContainingSelection,
	hoveredNodePathKey,
	measureAll,
}: {
	readonly targets: readonly T[];
	readonly selectedSequenceKeys: ReadonlySet<string>;
	readonly sequenceKeysContainingSelection: ReadonlySet<string>;
	readonly hoveredNodePathKey: string | null;
	readonly measureAll: boolean;
}): readonly T[] => {
	if (measureAll) {
		return targets;
	}

	const activeNodePathKeys = new Set<string>();
	for (const {key, nodePathInfo} of targets) {
		const nodePathKey = timelineSequenceNodePathToKey(
			nodePathInfo.sequenceSubscriptionKey,
		);
		if (
			selectedSequenceKeys.has(key) ||
			sequenceKeysContainingSelection.has(key) ||
			nodePathKey === hoveredNodePathKey
		) {
			activeNodePathKeys.add(nodePathKey);
		}
	}

	return targets.filter(({nodePathInfo}) =>
		activeNodePathKeys.has(
			timelineSequenceNodePathToKey(nodePathInfo.sequenceSubscriptionKey),
		),
	);
};

/** Builds selection state shared by canvas instances of the same source. */
export const getCanvasOutlineLayoutTargets = ({
	selectableOutlines,
	selectedSequenceKeys,
	sequenceKeysContainingSelection,
	targetKey,
}: {
	readonly selectableOutlines: readonly CanvasSelectableOutline[];
	readonly selectedSequenceKeys: ReadonlySet<string>;
	readonly sequenceKeysContainingSelection: ReadonlySet<string>;
	readonly targetKey: string | null;
}): CanvasOutlineLayoutTarget[] => {
	const firstNodePathInfoBySourceNode = new Map<string, SequenceNodePathInfo>();
	const selectedSourceNodeKeys = new Set<string>();
	for (const {key, nodePathInfo} of selectableOutlines) {
		const sourceNodeKey = timelineSequenceNodePathToKey(
			nodePathInfo.sequenceSubscriptionKey,
		);
		if (selectedSequenceKeys.has(key)) {
			selectedSourceNodeKeys.add(sourceNodeKey);
		}

		const currentFirst = firstNodePathInfoBySourceNode.get(sourceNodeKey);
		if (currentFirst === undefined || nodePathInfo.index < currentFirst.index) {
			firstNodePathInfoBySourceNode.set(sourceNodeKey, nodePathInfo);
		}
	}

	return selectableOutlines.flatMap((selectableOutline) => {
		const {key, nodePathInfo, sequence} = selectableOutline;
		if (targetKey !== null && targetKey !== key) {
			return [];
		}

		if (sequence.refForOutline === null) {
			throw new Error('Expected sequence to have a ref for outline');
		}

		const nodePathKey = timelineSequenceNodePathToKey(
			nodePathInfo.sequenceSubscriptionKey,
		);
		const selectionNodePathInfo =
			firstNodePathInfoBySourceNode.get(nodePathKey);
		if (selectionNodePathInfo === undefined) {
			throw new Error('Expected a first sequence for the source node');
		}

		const containsSelection = sequenceKeysContainingSelection.has(key);
		return [
			{
				...selectableOutline,
				nodePathKey,
				ref: sequence.refForOutline,
				selected: selectedSequenceKeys.has(key),
				containsSelection,
				showSelectedOutline:
					containsSelection || selectedSourceNodeKeys.has(nodePathKey),
				selection: {
					type: 'sequence' as const,
					nodePathInfo: selectionNodePathInfo,
				},
			},
		];
	});
};

/** Activation keeps frame subscriptions out of an idle outline overlay. */
export const getCanvasOutlineActivity = ({
	canvasHovered,
	dragging,
	contextMenuOpen,
	hasSelection,
	hoveredSequence,
}: {
	readonly canvasHovered: boolean;
	readonly dragging: boolean;
	readonly contextMenuOpen: boolean;
	readonly hasSelection: boolean;
	readonly hoveredSequence: CanvasHover | null;
}) => {
	const measureAllOutlines = canvasHovered || dragging || contextMenuOpen;
	return {
		measurementActive:
			measureAllOutlines ||
			hasSelection ||
			hoveredSequence?.source === 'timeline',
		measureAllOutlines,
		hoveredTimelineNodePathKey:
			hoveredSequence?.source === 'timeline'
				? hoveredSequence.nodePathKey
				: null,
	};
};
