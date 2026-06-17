import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
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
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND} from '../../helpers/colors';
import type {
	SequenceNodePathInfo,
	TrackWithHash,
} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {useKeybinding} from '../../helpers/use-keybinding';
import {useZIndex} from '../../state/z-index';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';
import {TimelineClipboardKeybindings} from './TimelineClipboardKeybindings';
import {TimelineDeleteKeybindings} from './TimelineDeleteKeybindings';

export const TIMELINE_SELECTED_BACKGROUND = '#3B3F42';
export const TIMELINE_SELECTED_LABEL_BACKGROUND = '#B0B0B0';
export const TIMELINE_SELECTED_LABEL_TEXT = 'black';
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
						? 'rgba(255, 255, 255, 0.1)'
						: TIMELINE_SELECTED_LABEL_BACKGROUND,
				}
			: {}),
	};
};

export const getTimelineColor = (selected: boolean, subcategory: boolean) => {
	return selected && !subcategory
		? TIMELINE_SELECTED_LABEL_TEXT
		: 'rgba(255, 255, 255, 0.8)';
};

export const getTimelineSelectedTrackHighlightStyle = (
	timelineWidth: number,
): CSSProperties => ({
	backgroundColor: TIMELINE_SELECTED_BACKGROUND,
	bottom: 0,
	left: -TIMELINE_PADDING,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: timelineWidth,
});

export const TIMELINE_BACKGROUND = '#0F1113';
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
	const intersectingCandidates = candidates.filter((candidate) => {
		return (
			getTimelineMarqueeSelectionKind(candidate.item) !== null &&
			timelineMarqueeRectsIntersect(candidate.rect, marqueeRect)
		);
	});
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

type TimelineSelectionContextValue = {
	readonly canSelect: boolean;
	readonly selectedItems: readonly TimelineSelection[];
	readonly isSelected: (item: TimelineSelection) => boolean;
	readonly selectItem: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
	) => void;
	readonly selectItems: (items: readonly TimelineSelection[]) => void;
	readonly registerSelectableItem: (item: TimelineSelection) => () => void;
	readonly registerMarqueeSelectableItem: (
		item: TimelineSelection,
		getRect: () => DOMRect | null,
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
	registerSelectableItem: () => () => undefined,
	registerMarqueeSelectableItem: () => () => undefined,
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

const CurrentTimelineSelectionContext =
	createContext<React.RefObject<TimelineSelectionContextValue> | null>(null);

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

export const TimelineSelectionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const timelineSelectionScope =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const {expandParentTracks} = useContext(ExpandedTracksSetterContext);
	const canSelect =
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const [selectedItems, setSelectedItems] = useState<
		readonly TimelineSelection[]
	>([]);
	const selectionAnchor = useRef<TimelineSelection | null>(null);
	const selectionScope = useRef<string | null>(null);
	const selectableItemsOrder = useRef(new Map<string, number>());
	const selectableItems = useRef(new Map<string, TimelineSelection>());
	const selectableItemRegistrationCounts = useRef(new Map<string, number>());
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
	const registrationCounter = useRef(0);
	const marqueeRegistrationCounter = useRef(0);

	useEffect(() => {
		if (!canSelect) {
			selectionScope.current = null;
			selectionAnchor.current = null;
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
		) => {
			if (!canSelectItem(item)) {
				return;
			}

			expandParentsForSelectionItem(item);

			setSelectedItems((currentSelectedItems) => {
				const currentSelectionState =
					getCurrentAvailableSelectionState(currentSelectedItems);
				const orderedSelectableItems = [
					...selectableItems.current.values(),
				].sort((a, b) => {
					return (
						(selectableItemsOrder.current.get(getTimelineSelectionKey(a)) ??
							0) -
						(selectableItemsOrder.current.get(getTimelineSelectionKey(b)) ?? 0)
					);
				});

				const nextState = getTimelineSelectionAfterInteraction({
					currentState: {
						selectedItems: currentSelectionState.selectedItems,
						anchor: currentSelectionState.anchor,
					},
					clickedItem: item,
					interaction,
					allSelectableItems: orderedSelectableItems,
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
			timelineSelectionScope,
		],
	);

	const selectItems = useCallback(
		(items: readonly TimelineSelection[]) => {
			if (!items.every(canSelectItem)) {
				return;
			}

			selectionScope.current = timelineSelectionScope;
			selectionAnchor.current =
				items.length === 0 ? null : items[items.length - 1];
			expandParentsForSelectionItems(items);
			setSelectedItems(items);
		},
		[canSelectItem, expandParentsForSelectionItems, timelineSelectionScope],
	);

	const registerSelectableItem = useCallback((item: TimelineSelection) => {
		const key = getTimelineSelectionKey(item);
		const currentRegistrationCount =
			selectableItemRegistrationCounts.current.get(key) ?? 0;
		if (currentRegistrationCount === 0) {
			const registrationOrder = registrationCounter.current;
			registrationCounter.current += 1;
			selectableItemsOrder.current.set(key, registrationOrder);
		}

		selectableItemRegistrationCounts.current.set(
			key,
			currentRegistrationCount + 1,
		);
		selectableItems.current.set(key, item);

		return () => {
			const nextRegistrationCount =
				(selectableItemRegistrationCounts.current.get(key) ?? 1) - 1;
			if (nextRegistrationCount > 0) {
				selectableItemRegistrationCounts.current.set(
					key,
					nextRegistrationCount,
				);
				return;
			}

			selectableItemRegistrationCounts.current.delete(key);
			selectableItems.current.delete(key);
			selectableItemsOrder.current.delete(key);
		};
	}, []);

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
			registerSelectableItem,
			registerMarqueeSelectableItem,
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
			registerSelectableItem,
			registerMarqueeSelectableItem,
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
	const {canSelect, getMarqueeSelection, selectItems} = useTimelineSelection();
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

			if (event.shiftKey || event.metaKey || event.ctrlKey) {
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
				selectItems(nextSelection.selectedItems);
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
		[canSelect, getMarqueeSelection, isHighestContext, selectItems],
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

export const useTimelineRowSelection = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	const {canSelect, isSelected, selectItem, registerSelectableItem} =
		useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection | null =>
			getTimelineSelectionFromNodePathInfo(nodePathInfo),
		[nodePathInfo],
	);

	useEffect(() => {
		if (selectionItem === null) {
			return;
		}

		return registerSelectableItem(selectionItem);
	}, [registerSelectableItem, selectionItem]);

	const selected = selectionItem === null ? false : isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			if (selectionItem === null) {
				return;
			}

			selectItem(selectionItem, interaction);
		},
		[selectItem, selectionItem],
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
	const {canSelect, isSelected, selectItem, registerSelectableItem} =
		useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'keyframe',
			nodePathInfo,
			frame,
		}),
		[nodePathInfo, frame],
	);

	useEffect(() => {
		return registerSelectableItem(selectionItem);
	}, [registerSelectableItem, selectionItem]);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			selectItem(selectionItem, interaction);
		},
		[selectItem, selectionItem],
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
	const {canSelect, isSelected, selectItem, registerSelectableItem} =
		useTimelineSelection();
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

	useEffect(() => {
		return registerSelectableItem(selectionItem);
	}, [registerSelectableItem, selectionItem]);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			selectItem(selectionItem, interaction);
		},
		[selectItem, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect,
		selected,
		selectionItem,
	};
};

export const useTimelineGuideSelection = (guideId: string) => {
	const {
		canSelect,
		clearSelection,
		isSelected,
		selectItem,
		registerSelectableItem,
	} = useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'guide',
			guideId,
		}),
		[guideId],
	);

	useEffect(() => {
		return registerSelectableItem(selectionItem);
	}, [registerSelectableItem, selectionItem]);

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
