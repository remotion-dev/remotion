import {
	canEditEasingForInterpolationFunction,
	stringifySequenceExpandedRowKey,
} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from 'react';
import {
	Internals,
	type GetDragOverrides,
	type GetEffectDragOverrides,
	type PropStatuses,
} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BACKGROUND,
	BLACK,
	TIMELINE_BACKGROUND_COLOR,
	TIMELINE_SELECTED_BACKGROUND_COLOR,
	TIMELINE_SELECTED_LABEL_BACKGROUND_COLOR,
	WHITE_ALPHA_10,
	WHITE_ALPHA_80,
} from '../../helpers/colors';
import type {
	SequenceNodePathInfo,
	TrackWithHash,
} from '../../helpers/get-timeline-sequence-sort-key';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	TIMELINE_PADDING,
	type TimelineTreeNode,
} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {useKeybinding} from '../../helpers/use-keybinding';
import {useZIndex} from '../../state/z-index';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
	type GetIsExpanded,
} from '../ExpandedTracksProvider';
import {selectOptionsSidebarInspectorPanel} from '../options-sidebar-tabs';
import {getNodeHasKeyframes, getNodeKeyframes} from './get-node-keyframes';
import {getTimelineEasingSegments} from './get-timeline-easing-segments';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {timelineVerticalScroll} from './timeline-refs';
import {TimelineClipboardKeybindings} from './TimelineClipboardKeybindings';
import {TimelineDeleteKeybindings} from './TimelineDeleteKeybindings';

export const TIMELINE_SELECTED_BACKGROUND = TIMELINE_SELECTED_BACKGROUND_COLOR;
export const TIMELINE_SELECTED_LABEL_BACKGROUND =
	TIMELINE_SELECTED_LABEL_BACKGROUND_COLOR;
export const TIMELINE_SELECTED_LABEL_TEXT = BLACK;
export const TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING = 2;

export const getTimelineSelectedLabelStyle = (
	selected: boolean,
	subcategory: boolean,
): CSSProperties => {
	return {
		paddingLeft: TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING,
		paddingRight: TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING,
		...(selected
			? {
					backgroundColor: subcategory
						? WHITE_ALPHA_10
						: TIMELINE_SELECTED_LABEL_BACKGROUND,
				}
			: {}),
	};
};

export const getTimelineColor = (selected: boolean, subcategory: boolean) => {
	return selected && !subcategory
		? TIMELINE_SELECTED_LABEL_TEXT
		: WHITE_ALPHA_80;
};

export const getTimelineSelectedTrackHighlightStyle = (
	timelineWidth: number,
	backgroundColor: string = TIMELINE_SELECTED_BACKGROUND,
): CSSProperties => ({
	backgroundColor,
	bottom: 0,
	left: -TIMELINE_PADDING,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: timelineWidth,
});

export const getTimelineRowHighlightBackground = ({
	showSelectedBackground,
	selected,
	containsSelection,
}: {
	readonly showSelectedBackground: boolean;
	readonly selected: boolean;
	readonly containsSelection: boolean;
}): string | undefined => {
	return showSelectedBackground && (selected || containsSelection)
		? TIMELINE_SELECTED_BACKGROUND
		: undefined;
};

export const TIMELINE_BACKGROUND = TIMELINE_BACKGROUND_COLOR;
export const TIMELINE_TICKS_BACKGROUND = BACKGROUND;

export type TimelineSelection =
	| {
			readonly type: 'guide';
			readonly guideId: string;
	  }
	| {
			readonly type: 'sequence';
			readonly nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			readonly type: 'sequence-prop';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly key: string;
	  }
	| {
			readonly type: 'sequence-all-effects';
			readonly nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			readonly type: 'sequence-effect';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly i: number;
	  }
	| {
			readonly type: 'sequence-effect-prop';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly i: number;
			readonly key: string;
	  }
	| {
			readonly type: 'keyframe';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly frame: number;
	  }
	| {
			readonly type: 'easing';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly fromFrame: number;
			readonly toFrame: number;
			readonly segmentIndex: number;
	  };

export type TimelineEasingSelection = Extract<
	TimelineSelection,
	{type: 'easing'}
>;

export type TimelineSelectionInteraction = {
	readonly shiftKey: boolean;
	readonly toggleKey: boolean;
};

export const isTimelineSelectionModifierEvent = ({
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}) => {
	return shiftKey || metaKey || ctrlKey;
};

export const shouldSelectTimelineRowOnPointerDown = ({
	selected,
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly selected: boolean;
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}) => {
	return (
		!selected || isTimelineSelectionModifierEvent({shiftKey, metaKey, ctrlKey})
	);
};

export type TimelineSelectionState = {
	readonly selectedItems: readonly TimelineSelection[];
	readonly anchor: TimelineSelection | null;
};

export const EMPTY_TIMELINE_SELECTION_STATE: TimelineSelectionState = {
	selectedItems: [],
	anchor: null,
};

export type TimelineMarqueeRect = {
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
};

export type TimelineMarqueeSelectionKind = 'sequence' | 'keyframes-and-easings';

export type TimelineMarqueeSelectionCandidate = {
	readonly item: TimelineSelection;
	readonly rect: TimelineMarqueeRect;
};

const getTimelineSelectionType = (item: TimelineSelection) => item.type;

const areTimelineSelectionTypesCompatible = (
	firstType: TimelineSelection['type'],
	secondType: TimelineSelection['type'],
): boolean => {
	if (firstType === secondType) {
		return true;
	}

	return (
		(firstType === 'sequence-prop' && secondType === 'sequence-effect-prop') ||
		(firstType === 'sequence-effect-prop' && secondType === 'sequence-prop') ||
		(firstType === 'keyframe' && secondType === 'easing') ||
		(firstType === 'easing' && secondType === 'keyframe')
	);
};

const isTimelineSelectionCompatibleWithType = (
	item: TimelineSelection,
	type: TimelineSelection['type'],
) => areTimelineSelectionTypesCompatible(getTimelineSelectionType(item), type);

const getTimelineSelectionAnchor = (
	selectedItems: readonly TimelineSelection[],
	previousAnchor: TimelineSelection | null,
	targetType: TimelineSelection['type'],
) => {
	if (
		previousAnchor &&
		getTimelineSelectionType(previousAnchor) === targetType
	) {
		return previousAnchor;
	}

	for (let i = selectedItems.length - 1; i >= 0; i--) {
		const candidate = selectedItems[i];
		if (getTimelineSelectionType(candidate) === targetType) {
			return candidate;
		}
	}

	return null;
};

const getRangeSelection = ({
	anchor,
	clickedItem,
	allSelectableItems,
}: {
	readonly anchor: TimelineSelection;
	readonly clickedItem: TimelineSelection;
	readonly allSelectableItems: readonly TimelineSelection[];
}): readonly TimelineSelection[] => {
	const anchorKey = getTimelineSelectionKey(anchor);
	const clickedKey = getTimelineSelectionKey(clickedItem);
	const orderedOfType = allSelectableItems.filter(
		(item) => getTimelineSelectionType(item) === clickedItem.type,
	);
	const anchorIndex = orderedOfType.findIndex(
		(item) => getTimelineSelectionKey(item) === anchorKey,
	);
	const clickedIndex = orderedOfType.findIndex(
		(item) => getTimelineSelectionKey(item) === clickedKey,
	);

	if (anchorIndex === -1 || clickedIndex === -1) {
		return [clickedItem];
	}

	const [from, to] =
		anchorIndex < clickedIndex
			? [anchorIndex, clickedIndex]
			: [clickedIndex, anchorIndex];
	return orderedOfType.slice(from, to + 1);
};

export const getTimelineSelectionAfterInteraction = ({
	currentState,
	clickedItem,
	interaction,
	allSelectableItems,
}: {
	readonly currentState: TimelineSelectionState;
	readonly clickedItem: TimelineSelection;
	readonly interaction: TimelineSelectionInteraction;
	readonly allSelectableItems: readonly TimelineSelection[];
}): TimelineSelectionState => {
	const {selectedItems, anchor: previousAnchor} = currentState;
	const clickedType = getTimelineSelectionType(clickedItem);
	if (clickedType === 'guide') {
		return {
			selectedItems: [clickedItem],
			anchor: clickedItem,
		};
	}

	const nextAnchor = getTimelineSelectionAnchor(
		selectedItems,
		previousAnchor,
		clickedType,
	);
	const clickedKey = getTimelineSelectionKey(clickedItem);

	if (interaction.shiftKey && nextAnchor) {
		return {
			selectedItems: getRangeSelection({
				anchor: nextAnchor,
				clickedItem,
				allSelectableItems,
			}),
			anchor: nextAnchor,
		};
	}

	if (interaction.toggleKey) {
		const compatibleItems = selectedItems.filter((item) =>
			isTimelineSelectionCompatibleWithType(item, clickedType),
		);
		const existingKeySet = new Set(
			compatibleItems.map(getTimelineSelectionKey),
		);
		if (existingKeySet.has(clickedKey)) {
			const toggledSelection = compatibleItems.filter(
				(item) => getTimelineSelectionKey(item) !== clickedKey,
			);
			return {
				selectedItems: toggledSelection,
				anchor: toggledSelection.length === 0 ? null : clickedItem,
			};
		}

		const selectableOrderMap = new Map(
			allSelectableItems
				.filter((item) =>
					isTimelineSelectionCompatibleWithType(item, clickedType),
				)
				.map((item, index) => [getTimelineSelectionKey(item), index] as const),
		);
		const extendedSelection = [...compatibleItems, clickedItem].sort((a, b) => {
			return (
				(selectableOrderMap.get(getTimelineSelectionKey(a)) ?? 0) -
				(selectableOrderMap.get(getTimelineSelectionKey(b)) ?? 0)
			);
		});
		return {
			selectedItems: extendedSelection,
			anchor: clickedItem,
		};
	}

	return {
		selectedItems: [clickedItem],
		anchor: clickedItem,
	};
};

export const getAvailableTimelineSelectionState = ({
	availableKeys,
	availableItemsByKey,
	state,
}: {
	readonly availableKeys: ReadonlySet<string>;
	readonly availableItemsByKey?: ReadonlyMap<string, TimelineSelection>;
	readonly state: TimelineSelectionState;
}): TimelineSelectionState => {
	if (state.selectedItems.length === 0 && state.anchor === null) {
		return state;
	}

	const getCurrentSelectionItem = (item: TimelineSelection) => {
		const key = getTimelineSelectionKey(item);
		if (!availableKeys.has(key)) {
			return null;
		}

		return availableItemsByKey?.get(key) ?? item;
	};

	const selectedItems = state.selectedItems
		.map(getCurrentSelectionItem)
		.filter((item): item is TimelineSelection => item !== null);
	const anchor = state.anchor ? getCurrentSelectionItem(state.anchor) : null;

	if (
		selectedItems.length === state.selectedItems.length &&
		anchor === state.anchor
	) {
		return state;
	}

	return {
		selectedItems,
		anchor,
	};
};

export const getNormalizedTimelineMarqueeRect = ({
	startX,
	startY,
	currentX,
	currentY,
}: {
	readonly startX: number;
	readonly startY: number;
	readonly currentX: number;
	readonly currentY: number;
}): TimelineMarqueeRect => ({
	left: Math.min(startX, currentX),
	top: Math.min(startY, currentY),
	right: Math.max(startX, currentX),
	bottom: Math.max(startY, currentY),
});

export const getClampedTimelineMarqueePoint = ({
	x,
	y,
	bounds,
}: {
	readonly x: number;
	readonly y: number;
	readonly bounds: TimelineMarqueeRect;
}): {
	readonly x: number;
	readonly y: number;
} => ({
	x: Math.min(bounds.right, Math.max(bounds.left, x)),
	y: Math.min(bounds.bottom, Math.max(bounds.top, y)),
});

export const timelineMarqueeRectsIntersect = (
	a: TimelineMarqueeRect,
	b: TimelineMarqueeRect,
) =>
	a.left <= b.right &&
	a.right >= b.left &&
	a.top <= b.bottom &&
	a.bottom >= b.top;

const getTimelineMarqueeSelectionKind = (
	item: TimelineSelection,
): TimelineMarqueeSelectionKind | null => {
	if (item.type === 'sequence') {
		return 'sequence';
	}

	if (item.type === 'keyframe' || item.type === 'easing') {
		return 'keyframes-and-easings';
	}

	return null;
};

const isTimelineSelectionCompatibleWithMarqueeKind = (
	item: TimelineSelection,
	kind: TimelineMarqueeSelectionKind,
) => {
	if (kind === 'sequence') {
		return item.type === 'sequence';
	}

	return item.type === 'keyframe' || item.type === 'easing';
};

export const getTimelineMarqueeSelection = ({
	candidates,
	lockedSelectionKind,
	marqueeRect,
}: {
	readonly candidates: readonly TimelineMarqueeSelectionCandidate[];
	readonly lockedSelectionKind: TimelineMarqueeSelectionKind | null;
	readonly marqueeRect: TimelineMarqueeRect;
}): {
	readonly lockedSelectionKind: TimelineMarqueeSelectionKind | null;
	readonly selectedItems: readonly TimelineSelection[];
} => {
	const geometricallyIntersectingCandidates = candidates.filter((candidate) => {
		return (
			getTimelineMarqueeSelectionKind(candidate.item) !== null &&
			timelineMarqueeRectsIntersect(candidate.rect, marqueeRect)
		);
	});
	const intersectingKeyframes = new Set(
		geometricallyIntersectingCandidates.flatMap((candidate) => {
			if (candidate.item.type !== 'keyframe') {
				return [];
			}

			return [
				`${timelineNodePathInfoToKey(candidate.item.nodePathInfo)}.${candidate.item.frame}`,
			];
		}),
	);
	const intersectingCandidates = geometricallyIntersectingCandidates.filter(
		(candidate) => {
			if (candidate.item.type !== 'easing') {
				return true;
			}

			const fieldKey = timelineNodePathInfoToKey(candidate.item.nodePathInfo);
			return (
				intersectingKeyframes.has(`${fieldKey}.${candidate.item.fromFrame}`) &&
				intersectingKeyframes.has(`${fieldKey}.${candidate.item.toFrame}`)
			);
		},
	);
	const getFirstIntersectingSelectionKind = () =>
		intersectingCandidates.length === 0
			? null
			: getTimelineMarqueeSelectionKind(intersectingCandidates[0].item);
	let nextLockedSelectionKind =
		lockedSelectionKind ?? getFirstIntersectingSelectionKind();
	const getSelectedItemsForKind = (kind: TimelineMarqueeSelectionKind) =>
		intersectingCandidates
			.filter((candidate) =>
				isTimelineSelectionCompatibleWithMarqueeKind(candidate.item, kind),
			)
			.map((candidate) => candidate.item);

	if (nextLockedSelectionKind === null) {
		return {lockedSelectionKind: null, selectedItems: []};
	}

	let selectedItems = getSelectedItemsForKind(nextLockedSelectionKind);
	if (lockedSelectionKind !== null && selectedItems.length === 0) {
		nextLockedSelectionKind = getFirstIntersectingSelectionKind();
		selectedItems =
			nextLockedSelectionKind === null
				? []
				: getSelectedItemsForKind(nextLockedSelectionKind);
	}

	return {
		lockedSelectionKind: nextLockedSelectionKind,
		selectedItems,
	};
};

export const extendTimelineMarqueeSelection = ({
	currentSelection,
	marqueeSelection,
}: {
	readonly currentSelection: readonly TimelineSelection[];
	readonly marqueeSelection: readonly TimelineSelection[];
}): readonly TimelineSelection[] => {
	if (marqueeSelection.length === 0) {
		return currentSelection;
	}

	const marqueeKind = getTimelineMarqueeSelectionKind(marqueeSelection[0]);
	if (marqueeKind === null) {
		return marqueeSelection;
	}

	const selectedKeys = new Set(
		currentSelection.map((item) => getTimelineSelectionKey(item)),
	);
	return [
		...currentSelection.filter((item) =>
			isTimelineSelectionCompatibleWithMarqueeKind(item, marqueeKind),
		),
		...marqueeSelection.filter((item) => {
			const key = getTimelineSelectionKey(item);
			if (selectedKeys.has(key)) {
				return false;
			}

			selectedKeys.add(key);
			return true;
		}),
	];
};

type TimelineSelectionContextValue = {
	readonly canSelect: boolean;
	readonly selectedItems: readonly TimelineSelection[];
	readonly isSelected: (item: TimelineSelection) => boolean;
	readonly selectItem: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
		allSelectableItems?: readonly TimelineSelection[],
		options?: TimelineSelectionOptions,
	) => void;
	readonly selectItems: (
		items: readonly TimelineSelection[],
		options?: TimelineSelectionOptions,
	) => void;
	readonly registerMarqueeSelectableItem: (
		item: TimelineSelection,
		getRect: () => DOMRect | null,
	) => () => void;
	readonly registerFocusableItem: (
		item: TimelineSelection,
		getElement: () => Element | null,
	) => () => void;
	readonly getMarqueeSelection: (
		marqueeRect: TimelineMarqueeRect,
		lockedSelectionKind: TimelineMarqueeSelectionKind | null,
	) => {
		readonly lockedSelectionKind: TimelineMarqueeSelectionKind | null;
		readonly selectedItems: readonly TimelineSelection[];
	};
	readonly containsSelection: (nodePathInfo: SequenceNodePathInfo) => boolean;
	readonly clearSelection: () => void;
};

const defaultTimelineSelectionContextValue: TimelineSelectionContextValue = {
	canSelect: false,
	selectedItems: [],
	isSelected: () => false,
	selectItem: () => undefined,
	selectItems: () => undefined,
	registerMarqueeSelectableItem: () => () => undefined,
	registerFocusableItem: () => () => undefined,
	getMarqueeSelection: () => ({
		lockedSelectionKind: null,
		selectedItems: [],
	}),
	containsSelection: () => false,
	clearSelection: () => undefined,
};

const TimelineSelectionContext = createContext<TimelineSelectionContextValue>(
	defaultTimelineSelectionContextValue,
);

const EMPTY_SELECTABLE_TIMELINE_ITEMS: readonly TimelineSelection[] = [];

const SelectableTimelineItemsContext = createContext<
	React.RefObject<readonly TimelineSelection[]>
>({current: EMPTY_SELECTABLE_TIMELINE_ITEMS});

export const TimelineSelectionOrderProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly items: readonly TimelineSelection[];
}> = ({children, items}) => {
	const itemsRef = useRef(items);
	itemsRef.current = items;

	return (
		<SelectableTimelineItemsContext.Provider value={itemsRef}>
			{children}
		</SelectableTimelineItemsContext.Provider>
	);
};

const CurrentTimelineSelectionContext =
	createContext<React.RefObject<TimelineSelectionContextValue> | null>(null);

const TIMELINE_SELECTION_REVEAL_RETRY_COUNT = 2;

type TimelineSelectionOptions = {
	readonly reveal?: boolean;
};

type TimelineSelectionRevealRequest = {
	readonly key: string;
	readonly token: number;
};

type TimelineFocusableItem = {
	readonly getElement: () => Element | null;
	readonly order: number;
};

const parseEffectIndex = (effectIndex: string): number | null => {
	const parsed = Number(effectIndex);
	if (!Number.isInteger(parsed) || parsed < 0) {
		return null;
	}

	return parsed;
};

export const getTimelineSelectionFromNodePathInfo = (
	nodePathInfo: SequenceNodePathInfo | null,
): TimelineSelection | null => {
	if (nodePathInfo === null) {
		return null;
	}

	const {auxiliaryKeys} = nodePathInfo;
	if (auxiliaryKeys.length === 0) {
		return {type: 'sequence', nodePathInfo};
	}

	if (auxiliaryKeys.length === 2 && auxiliaryKeys[0] === 'controls') {
		return {type: 'sequence-prop', nodePathInfo, key: auxiliaryKeys[1]};
	}

	if (auxiliaryKeys.length === 1 && auxiliaryKeys[0] === 'effects') {
		return {type: 'sequence-all-effects', nodePathInfo};
	}

	if (auxiliaryKeys[0] === 'effects') {
		const effectIndex = parseEffectIndex(auxiliaryKeys[1]);
		if (effectIndex === null) {
			return null;
		}

		if (auxiliaryKeys.length === 2) {
			return {type: 'sequence-effect', nodePathInfo, i: effectIndex};
		}

		if (auxiliaryKeys.length === 3) {
			return {
				type: 'sequence-effect-prop',
				nodePathInfo,
				i: effectIndex,
				key: auxiliaryKeys[2],
			};
		}
	}

	return null;
};

export const getTimelineSelectionKey = (item: TimelineSelection): string => {
	switch (item.type) {
		case 'guide':
			return `guide.${item.guideId}`;
		case 'sequence':
			return `${getTimelineSequenceSelectionKey(item.nodePathInfo)}.sequence`;
		case 'sequence-prop':
			return `${getTimelineSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-prop.${item.key}`;
		case 'sequence-all-effects':
			return `${getTimelineSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-all-effects`;
		case 'sequence-effect':
			return `${getTimelineSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-effect.${item.i}`;
		case 'sequence-effect-prop':
			return `${getTimelineSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-effect-prop.${item.i}.${item.key}`;
		case 'keyframe':
			return `${timelineNodePathInfoToKey(item.nodePathInfo)}.keyframe.${
				item.frame
			}`;
		case 'easing':
			return `${timelineNodePathInfoToKey(item.nodePathInfo)}.easing.${
				item.segmentIndex
			}`;
		default:
			throw new Error(
				`Unexpected timeline selection type: ${item satisfies never}`,
			);
	}
};

const nodePathDescendsFrom = (
	descendant: SequenceNodePathInfo,
	ancestor: SequenceNodePathInfo,
): boolean => {
	if (
		stringifySequenceExpandedRowKey(descendant.sequenceSubscriptionKey) !==
		stringifySequenceExpandedRowKey(ancestor.sequenceSubscriptionKey)
	) {
		return false;
	}

	if (descendant.index !== ancestor.index) {
		return false;
	}

	// Must be strictly deeper than `ancestor` (i.e. a descendant), not the same row.
	if (descendant.auxiliaryKeys.length <= ancestor.auxiliaryKeys.length) {
		return false;
	}

	return ancestor.auxiliaryKeys.every(
		(key, i) => descendant.auxiliaryKeys[i] === key,
	);
};

export const getSelectableTimelineSequenceSelections = (
	tracks: readonly Pick<TrackWithHash, 'nodePathInfo'>[],
): TimelineSelection[] => {
	return tracks.flatMap((track): TimelineSelection[] => {
		if (
			track.nodePathInfo === null ||
			track.nodePathInfo.auxiliaryKeys.length > 0
		) {
			return [];
		}

		return [{type: 'sequence', nodePathInfo: track.nodePathInfo}];
	});
};

const getTimelineTreeNodeCanEditEasing = ({
	node,
	nodePathInfo,
	propStatuses,
}: {
	readonly node: TimelineTreeNode;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly propStatuses: PropStatuses;
}) => {
	if (node.kind !== 'field' || node.field === null) {
		return false;
	}

	if (node.field.kind === 'sequence-field') {
		const sequencePropStatus = Internals.getPropStatusesCtx(
			propStatuses,
			nodePathInfo.sequenceSubscriptionKey,
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
		nodePath: nodePathInfo.sequenceSubscriptionKey,
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

export const getSelectableTimelineItems = ({
	getDragOverrides,
	getEffectDragOverrides,
	getIsExpanded,
	propStatuses,
	selectedItems,
	timeline,
	timelinePosition,
}: {
	readonly getDragOverrides: GetDragOverrides;
	readonly getEffectDragOverrides: GetEffectDragOverrides;
	readonly getIsExpanded: GetIsExpanded;
	readonly propStatuses: PropStatuses;
	readonly selectedItems: readonly TimelineSelection[];
	readonly timeline: readonly TrackWithHash[];
	readonly timelinePosition: number;
}): TimelineSelection[] => {
	const selectedRowKeys = getSelectedTimelineExpandedRowKeys(selectedItems);

	return timeline.flatMap((track): TimelineSelection[] => {
		const {nodePathInfo} = track;
		if (nodePathInfo === null) {
			return [];
		}

		const sequenceSelection =
			getTimelineSelectionFromNodePathInfo(nodePathInfo);
		if (sequenceSelection === null) {
			return [];
		}

		if (!getIsExpanded(nodePathInfo)) {
			return [sequenceSelection];
		}

		const tree = buildTimelineTree({
			sequence: track.sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			propStatuses,
			includeTextContent: false,
			includeSourceControls: false,
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
		const visibleTreeRows = flattenVisibleTreeNodes({
			nodes: filteredTree,
			getIsExpanded,
		});

		return [
			sequenceSelection,
			...visibleTreeRows.flatMap(({node}): TimelineSelection[] => {
				const rowSelection = getTimelineSelectionFromNodePathInfo(
					node.nodePathInfo,
				);
				if (rowSelection === null) {
					return [];
				}

				const keyframes = getNodeKeyframes({
					node,
					nodePath: nodePathInfo.sequenceSubscriptionKey,
					propStatuses,
					keyframeDisplayOffset: track.keyframeDisplayOffset,
					getDragOverrides,
					getEffectDragOverrides,
					timelinePosition,
				});
				const keyframeSelections = keyframes.map(
					(keyframe): TimelineSelection => ({
						type: 'keyframe',
						nodePathInfo: node.nodePathInfo,
						frame: keyframe.frame,
					}),
				);
				const easingSelections = getTimelineTreeNodeCanEditEasing({
					node,
					nodePathInfo,
					propStatuses,
				})
					? getTimelineEasingSegments(keyframes).map(
							(segment): TimelineSelection => ({
								type: 'easing',
								nodePathInfo: node.nodePathInfo,
								fromFrame: segment.fromFrame,
								toFrame: segment.toFrame,
								segmentIndex: segment.segmentIndex,
							}),
						)
					: [];

				return [rowSelection, ...easingSelections, ...keyframeSelections];
			}),
		];
	});
};

export const getTimelineSequenceSelectionKey = (
	nodePathInfo: SequenceNodePathInfo,
): string => timelineNodePathInfoToKey({...nodePathInfo, auxiliaryKeys: []});

export const TimelineSelectAllKeybindings: React.FC<{
	readonly timeline: readonly TrackWithHash[];
}> = ({timeline}) => {
	const keybindings = useKeybinding();
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	const selectableSequenceSelections = useMemo(
		() => getSelectableTimelineSequenceSelections(timeline),
		[timeline],
	);
	const selectableSequenceSelectionsRef = useRef(selectableSequenceSelections);
	selectableSequenceSelectionsRef.current = selectableSequenceSelections;

	useEffect(() => {
		if (!canSelect) {
			return;
		}

		const selectAll = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'a',
			callback: () => {
				const latestSelectableSequenceSelections =
					selectableSequenceSelectionsRef.current;
				if (latestSelectableSequenceSelections.length === 0) {
					return;
				}

				currentSelection.current.selectItems(
					latestSelectableSequenceSelections,
				);
			},
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			selectAll.unregister();
		};
	}, [canSelect, currentSelection, keybindings]);

	return null;
};

const TimelineEscapeKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	useEffect(() => {
		const escape = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Escape',
			callback: (event) => {
				const {selectedItems, clearSelection} = currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				clearSelection();
				event.preventDefault();
			},
			commandCtrlKey: false,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			escape.unregister();
		};
	}, [currentSelection, keybindings]);

	return null;
};

export const TimelineSelectableItemsProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly timeline: readonly TrackWithHash[];
}> = ({children, timeline}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {selectedItems} = useTimelineSelection();
	const selectableItems = useMemo(
		() =>
			getSelectableTimelineItems({
				getDragOverrides,
				getEffectDragOverrides,
				getIsExpanded,
				propStatuses,
				selectedItems,
				timeline,
				timelinePosition,
			}),
		[
			getDragOverrides,
			getEffectDragOverrides,
			getIsExpanded,
			propStatuses,
			selectedItems,
			timeline,
			timelinePosition,
		],
	);

	return (
		<TimelineSelectionOrderProvider items={selectableItems}>
			{children}
		</TimelineSelectionOrderProvider>
	);
};

export const TimelineSelectionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const timelineSelectionScope =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const {expandParentTracks} = useContext(ExpandedTracksSetterContext);
	const canSelect =
		studioInteractivityEnabled &&
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const [selectedItems, setSelectedItems] = useState<
		readonly TimelineSelection[]
	>([]);
	const selectionAnchor = useRef<TimelineSelection | null>(null);
	const selectionScope = useRef<string | null>(null);
	const marqueeSelectableItems = useRef(
		new Map<
			string,
			{
				readonly getRect: () => DOMRect | null;
				readonly item: TimelineSelection;
				readonly order: number;
			}
		>(),
	);
	const marqueeRegistrationCounter = useRef(0);
	const focusableItems = useRef(
		new Map<string, Map<number, TimelineFocusableItem>>(),
	);
	const focusableRegistrationCounter = useRef(0);
	const [revealRequest, setRevealRequest] =
		useState<TimelineSelectionRevealRequest | null>(null);

	useEffect(() => {
		if (!canSelect) {
			selectionScope.current = null;
			selectionAnchor.current = null;
			setRevealRequest(null);
			setSelectedItems([]);
		}
	}, [canSelect]);

	const canSelectItem = useCallback(
		(_item: TimelineSelection) => canSelect,
		[canSelect],
	);

	const getCurrentAvailableSelectionState = useCallback(
		(currentSelectedItems: readonly TimelineSelection[]) => {
			if (selectionScope.current !== timelineSelectionScope) {
				return EMPTY_TIMELINE_SELECTION_STATE;
			}

			return {
				selectedItems: currentSelectedItems,
				anchor: selectionAnchor.current,
			};
		},
		[timelineSelectionScope],
	);

	const availableSelectionState =
		getCurrentAvailableSelectionState(selectedItems);
	const availableSelectedItems = availableSelectionState.selectedItems;

	const revealSelectionKey = useCallback((selectedKey: string) => {
		let cancelled = false;
		let animationFrame: number | null = null;

		const reveal = (attempt: number) => {
			if (cancelled) {
				return;
			}

			const scrollParent = timelineVerticalScroll.current;
			const focusableRegistrations = focusableItems.current.get(selectedKey);
			const focusableElement =
				scrollParent && focusableRegistrations
					? [...focusableRegistrations.values()]
							.sort((a, b) => a.order - b.order)
							.map((registered) => registered.getElement())
							.find(
								(element): element is Element =>
									element !== null && scrollParent.contains(element),
							)
					: null;
			const rect =
				focusableElement?.getBoundingClientRect() ??
				marqueeSelectableItems.current.get(selectedKey)?.getRect();

			if (!scrollParent || !rect) {
				if (attempt < TIMELINE_SELECTION_REVEAL_RETRY_COUNT) {
					animationFrame = requestAnimationFrame(() => reveal(attempt + 1));
				}

				return;
			}

			const parentRect = scrollParent.getBoundingClientRect();
			if (rect.top >= parentRect.top && rect.bottom <= parentRect.bottom) {
				return;
			}

			const elementCenter = rect.top + rect.height / 2;
			const parentCenter = parentRect.top + parentRect.height / 2;
			scrollParent.scrollTop += elementCenter - parentCenter;
		};

		animationFrame = requestAnimationFrame(() => reveal(0));

		return () => {
			cancelled = true;
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, []);

	useEffect(() => {
		if (revealRequest === null) {
			return;
		}

		return revealSelectionKey(revealRequest.key);
	}, [revealRequest, revealSelectionKey]);

	const requestRevealSelectionItem = useCallback((item: TimelineSelection) => {
		const key = getTimelineSelectionKey(item);
		setRevealRequest((previousRequest) => ({
			key,
			token: (previousRequest?.token ?? 0) + 1,
		}));
	}, []);

	const expandParentsForSelectionItems = useCallback(
		(items: readonly TimelineSelection[]) => {
			for (const item of items) {
				if (item.type === 'guide') {
					continue;
				}

				expandParentTracks(item.nodePathInfo);
			}
		},
		[expandParentTracks],
	);

	const expandParentsForSelectionItem = useCallback(
		(item: TimelineSelection) => {
			if (item.type === 'guide') {
				return;
			}

			expandParentTracks(item.nodePathInfo);
		},
		[expandParentTracks],
	);

	useEffect(() => {
		setSelectedItems((currentSelectedItems) => {
			const nextState =
				selectionScope.current === timelineSelectionScope
					? {
							selectedItems: currentSelectedItems,
							anchor: selectionAnchor.current,
						}
					: EMPTY_TIMELINE_SELECTION_STATE;

			selectionScope.current = timelineSelectionScope;
			selectionAnchor.current = nextState.anchor;

			if (
				nextState.selectedItems.length === currentSelectedItems.length &&
				nextState.selectedItems.every(
					(item, index) => item === currentSelectedItems[index],
				)
			) {
				return currentSelectedItems;
			}

			return nextState.selectedItems;
		});
	}, [timelineSelectionScope]);

	const selectedKeys = useMemo(
		() => new Set(availableSelectedItems.map(getTimelineSelectionKey)),
		[availableSelectedItems],
	);

	const isSelected = useCallback(
		(item: TimelineSelection) => {
			return selectedKeys.has(getTimelineSelectionKey(item));
		},
		[selectedKeys],
	);

	const selectItem = useCallback(
		(
			item: TimelineSelection,
			interaction: TimelineSelectionInteraction = {
				shiftKey: false,
				toggleKey: false,
			},
			allSelectableItems: readonly TimelineSelection[] = [],
			options: TimelineSelectionOptions = {},
		) => {
			if (!canSelectItem(item)) {
				return;
			}

			selectOptionsSidebarInspectorPanel();
			expandParentsForSelectionItem(item);
			if (options.reveal) {
				requestRevealSelectionItem(item);
			}

			setSelectedItems((currentSelectedItems) => {
				const currentSelectionState =
					getCurrentAvailableSelectionState(currentSelectedItems);

				const nextState = getTimelineSelectionAfterInteraction({
					currentState: {
						selectedItems: currentSelectionState.selectedItems,
						anchor: currentSelectionState.anchor,
					},
					clickedItem: item,
					interaction,
					allSelectableItems,
				});
				selectionScope.current = timelineSelectionScope;
				selectionAnchor.current = nextState.anchor;
				return nextState.selectedItems;
			});
		},
		[
			canSelectItem,
			expandParentsForSelectionItem,
			getCurrentAvailableSelectionState,
			requestRevealSelectionItem,
			timelineSelectionScope,
		],
	);

	const selectItems = useCallback(
		(
			items: readonly TimelineSelection[],
			options: TimelineSelectionOptions = {},
		) => {
			if (!items.every(canSelectItem)) {
				return;
			}

			if (items.length > 0) {
				selectOptionsSidebarInspectorPanel();
			}

			selectionScope.current = timelineSelectionScope;
			selectionAnchor.current =
				items.length === 0 ? null : items[items.length - 1];
			expandParentsForSelectionItems(items);
			if (options.reveal && items.length === 1) {
				requestRevealSelectionItem(items[0]);
			}

			setSelectedItems(items);
		},
		[
			canSelectItem,
			expandParentsForSelectionItems,
			requestRevealSelectionItem,
			timelineSelectionScope,
		],
	);

	const registerMarqueeSelectableItem = useCallback(
		(item: TimelineSelection, getRect: () => DOMRect | null) => {
			const key = getTimelineSelectionKey(item);
			const registrationOrder = marqueeRegistrationCounter.current;
			marqueeRegistrationCounter.current += 1;
			marqueeSelectableItems.current.set(key, {
				getRect,
				item,
				order: registrationOrder,
			});
			return () => {
				marqueeSelectableItems.current.delete(key);
			};
		},
		[],
	);

	const registerFocusableItem = useCallback(
		(item: TimelineSelection, getElement: () => Element | null) => {
			const key = getTimelineSelectionKey(item);
			const registrationOrder = focusableRegistrationCounter.current;
			focusableRegistrationCounter.current += 1;
			const registrations =
				focusableItems.current.get(key) ??
				new Map<number, TimelineFocusableItem>();
			registrations.set(registrationOrder, {
				getElement,
				order: registrationOrder,
			});
			focusableItems.current.set(key, registrations);
			return () => {
				const latestRegistrations = focusableItems.current.get(key);
				latestRegistrations?.delete(registrationOrder);
				if (latestRegistrations?.size === 0) {
					focusableItems.current.delete(key);
				}
			};
		},
		[],
	);

	const getMarqueeSelectionForRect = useCallback(
		(
			marqueeRect: TimelineMarqueeRect,
			lockedSelectionKind: TimelineMarqueeSelectionKind | null,
		) => {
			const candidates = [...marqueeSelectableItems.current.values()]
				.sort((a, b) => a.order - b.order)
				.flatMap((candidate): TimelineMarqueeSelectionCandidate[] => {
					if (!canSelectItem(candidate.item)) {
						return [];
					}

					const rect = candidate.getRect();
					if (rect === null) {
						return [];
					}

					return [
						{
							item: candidate.item,
							rect: {
								bottom: rect.bottom,
								left: rect.left,
								right: rect.right,
								top: rect.top,
							},
						},
					];
				});

			return getTimelineMarqueeSelection({
				candidates,
				lockedSelectionKind,
				marqueeRect,
			});
		},
		[canSelectItem],
	);

	const clearSelection = useCallback(() => {
		selectionScope.current = null;
		selectionAnchor.current = null;
		setSelectedItems([]);
	}, []);

	const containsSelection = useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			return availableSelectedItems.some(
				(selected) =>
					selected.type !== 'guide' &&
					nodePathDescendsFrom(selected.nodePathInfo, nodePathInfo),
			);
		},
		[availableSelectedItems],
	);

	const value = useMemo(
		(): TimelineSelectionContextValue => ({
			canSelect,
			selectedItems: availableSelectedItems,
			isSelected,
			selectItem,
			selectItems,
			registerMarqueeSelectableItem,
			registerFocusableItem,
			getMarqueeSelection: getMarqueeSelectionForRect,
			containsSelection,
			clearSelection,
		}),
		[
			canSelect,
			availableSelectedItems,
			isSelected,
			selectItem,
			selectItems,
			registerMarqueeSelectableItem,
			registerFocusableItem,
			getMarqueeSelectionForRect,
			containsSelection,
			clearSelection,
		],
	);
	const currentSelection = useRef(value);
	currentSelection.current = value;

	return (
		<CurrentTimelineSelectionContext.Provider value={currentSelection}>
			<TimelineSelectionContext.Provider value={value}>
				{children}
				<TimelineEscapeKeybindings />
				<TimelineClipboardKeybindings />
				<TimelineDeleteKeybindings />
			</TimelineSelectionContext.Provider>
		</CurrentTimelineSelectionContext.Provider>
	);
};

export const useTimelineSelection = () => {
	return useContext(TimelineSelectionContext);
};

export const TIMELINE_MARQUEE_ITEM_ATTR = 'data-timeline-marquee-item';
export const TIMELINE_SCRUBBER_ATTR = 'data-timeline-scrubber';

export const useCurrentTimelineSelectionStateAsRef = () => {
	const currentSelection = useContext(CurrentTimelineSelectionContext);
	if (currentSelection === null) {
		throw new Error(
			'useCurrentTimelineSelectionStateAsRef must be used inside TimelineSelectionProvider',
		);
	}

	return currentSelection;
};

export const useTimelineMarqueeSelection = () => {
	const {canSelect, getMarqueeSelection, selectedItems, selectItems} =
		useTimelineSelection();
	const {isHighestContext} = useZIndex();
	const [marqueeRect, setMarqueeRect] = useState<TimelineMarqueeRect | null>(
		null,
	);

	const onPointerDownCapture = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!isHighestContext) {
				return;
			}

			if (event.button !== 0 || !canSelect) {
				return;
			}

			if (event.shiftKey) {
				return;
			}

			if (!(event.target instanceof Element)) {
				return;
			}

			if (
				event.target.closest(`[${TIMELINE_MARQUEE_ITEM_ATTR}]`) ||
				event.target.closest(`[${TIMELINE_SCRUBBER_ATTR}]`)
			) {
				return;
			}

			const {currentTarget: target, pointerId} = event;
			if (target.setPointerCapture) {
				target.setPointerCapture(pointerId);
			}

			const initialBounds = target.getBoundingClientRect();
			const marqueeBounds: TimelineMarqueeRect = {
				bottom: initialBounds.bottom,
				left: initialBounds.left,
				right: initialBounds.right,
				top: initialBounds.top,
			};
			const start = getClampedTimelineMarqueePoint({
				bounds: marqueeBounds,
				x: event.clientX,
				y: event.clientY,
			});
			const startX = start.x;
			const startY = start.y;
			const previousUserSelect = document.body.style.userSelect;
			const previousWebkitUserSelect = document.body.style.webkitUserSelect;
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';

			let hasDragged = false;
			let lockedSelectionKind: TimelineMarqueeSelectionKind | null = null;
			const extendSelection = event.metaKey || event.ctrlKey;
			const selectionBeforeMarquee = selectedItems;

			const cleanup = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerCancel);
				if (target.hasPointerCapture?.(pointerId)) {
					target.releasePointerCapture(pointerId);
				}

				document.body.style.userSelect = previousUserSelect;
				document.body.style.webkitUserSelect = previousWebkitUserSelect;
				setMarqueeRect(null);
			};

			const updateSelection = (clientX: number, clientY: number) => {
				const current = getClampedTimelineMarqueePoint({
					bounds: marqueeBounds,
					x: clientX,
					y: clientY,
				});
				if (
					!hasDragged &&
					Math.max(Math.abs(current.x - startX), Math.abs(current.y - startY)) <
						3
				) {
					return;
				}

				hasDragged = true;
				const rect = getNormalizedTimelineMarqueeRect({
					currentX: current.x,
					currentY: current.y,
					startX,
					startY,
				});
				const nextSelection = getMarqueeSelection(rect, lockedSelectionKind);
				lockedSelectionKind = nextSelection.lockedSelectionKind;
				setMarqueeRect(rect);
				selectItems(
					extendSelection
						? extendTimelineMarqueeSelection({
								currentSelection: selectionBeforeMarquee,
								marqueeSelection: nextSelection.selectedItems,
							})
						: nextSelection.selectedItems,
				);
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				updateSelection(moveEvent.clientX, moveEvent.clientY);
			};

			const onPointerUp = (upEvent: PointerEvent) => {
				updateSelection(upEvent.clientX, upEvent.clientY);
				cleanup();
			};

			const onPointerCancel = () => {
				cleanup();
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerCancel);
		},
		[
			canSelect,
			getMarqueeSelection,
			isHighestContext,
			selectedItems,
			selectItems,
		],
	);

	return {marqueeRect, onPointerDownCapture};
};

export const useTimelineMarqueeSelectableItem = (
	item: TimelineSelection | null,
	ref: React.RefObject<Element | null>,
) => {
	const {registerMarqueeSelectableItem} = useTimelineSelection();

	useEffect(() => {
		if (item === null) {
			return;
		}

		return registerMarqueeSelectableItem(
			item,
			() => ref.current?.getBoundingClientRect() ?? null,
		);
	}, [item, ref, registerMarqueeSelectableItem]);
};

export const useTimelineFocusableItem = (
	item: TimelineSelection | null,
	ref: React.RefObject<Element | null>,
) => {
	const {registerFocusableItem} = useTimelineSelection();

	useEffect(() => {
		if (item === null) {
			return;
		}

		return registerFocusableItem(item, () => ref.current);
	}, [item, ref, registerFocusableItem]);
};

export const useTimelineRowSelection = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectableTimelineItemsRef = useContext(SelectableTimelineItemsContext);
	const selectionItem = useMemo(
		(): TimelineSelection | null =>
			getTimelineSelectionFromNodePathInfo(nodePathInfo),
		[nodePathInfo],
	);

	const selected = selectionItem === null ? false : isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			if (selectionItem === null) {
				return;
			}

			selectItem(
				selectionItem,
				interaction,
				selectableTimelineItemsRef.current,
				{reveal: true},
			);
		},
		[selectItem, selectableTimelineItemsRef, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect && selectionItem !== null,
		selectionItem,
		selected,
	};
};

export const useTimelineKeyframeSelection = (
	nodePathInfo: SequenceNodePathInfo,
	frame: number,
) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectableTimelineItemsRef = useContext(SelectableTimelineItemsContext);
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'keyframe',
			nodePathInfo,
			frame,
		}),
		[nodePathInfo, frame],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			selectItem(
				selectionItem,
				interaction,
				selectableTimelineItemsRef.current,
			);
		},
		[selectItem, selectableTimelineItemsRef, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect,
		selectionItem,
		selected,
	};
};

export const useTimelineEasingSelection = ({
	nodePathInfo,
	fromFrame,
	toFrame,
	segmentIndex,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly segmentIndex: number;
}) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectableTimelineItemsRef = useContext(SelectableTimelineItemsContext);
	const selectionItem = useMemo(
		(): TimelineEasingSelection => ({
			type: 'easing',
			nodePathInfo,
			fromFrame,
			toFrame,
			segmentIndex,
		}),
		[nodePathInfo, fromFrame, segmentIndex, toFrame],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			selectItem(
				selectionItem,
				interaction,
				selectableTimelineItemsRef.current,
			);
		},
		[selectItem, selectableTimelineItemsRef, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect,
		selected,
		selectionItem,
	};
};

export const useTimelineGuideSelection = (guideId: string) => {
	const {canSelect, clearSelection, isSelected, selectItem} =
		useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'guide',
			guideId,
		}),
		[guideId],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(() => {
		selectItem(selectionItem);
	}, [selectItem, selectionItem]);

	return {
		clearSelection,
		onSelect,
		selectable: canSelect,
		selected,
		selectionItem,
	};
};

export const useTimelineRowContainsSelection = (
	nodePathInfo: SequenceNodePathInfo | null,
): boolean => {
	const {containsSelection} = useTimelineSelection();
	if (nodePathInfo === null) {
		return false;
	}

	return containsSelection(nodePathInfo);
};

export const useTimelineRowHighlightBackground = (
	nodePathInfo: SequenceNodePathInfo | null,
): string | undefined => {
	const {selected} = useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	return getTimelineRowHighlightBackground({
		showSelectedBackground: true,
		selected,
		containsSelection,
	});
};
