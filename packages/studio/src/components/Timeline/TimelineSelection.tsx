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
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {
	SequenceNodePathInfo,
	TrackWithHash,
} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {useKeybinding} from '../../helpers/use-keybinding';
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

export const SELECTION_ENABLED = false;
export const TIMELINE_TOP_DRAG = false;
export const ENABLE_OUTLINES = false;
export const EASING_SELECTION_ENABLED = false;

type TimelineSelectionBase = {
	readonly nodePathInfo: SequenceNodePathInfo;
};

export type TimelineSelection =
	| (TimelineSelectionBase & {
			readonly type: 'sequence';
	  })
	| (TimelineSelectionBase & {
			readonly type: 'sequence-prop';
			readonly key: string;
	  })
	| (TimelineSelectionBase & {
			readonly type: 'sequence-all-effects';
	  })
	| (TimelineSelectionBase & {
			readonly type: 'sequence-effect';
			readonly i: number;
	  })
	| (TimelineSelectionBase & {
			readonly type: 'sequence-effect-prop';
			readonly i: number;
			readonly key: string;
	  })
	| (TimelineSelectionBase & {
			readonly type: 'keyframe';
			readonly frame: number;
	  })
	| (TimelineSelectionBase & {
			readonly type: 'easing';
			readonly fromFrame: number;
			readonly toFrame: number;
			readonly segmentIndex: number;
	  });

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

export type TimelineSelectionState = {
	readonly selectedItems: readonly TimelineSelection[];
	readonly anchor: TimelineSelection | null;
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
	readonly canSelectEasing: boolean;
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
	canSelectEasing: false,
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
	const sequenceKey = getTimelineSequenceSelectionKey(item.nodePathInfo);
	switch (item.type) {
		case 'sequence':
			return `${sequenceKey}.sequence`;
		case 'sequence-prop':
			return `${sequenceKey}.sequence-prop.${item.key}`;
		case 'sequence-all-effects':
			return `${sequenceKey}.sequence-all-effects`;
		case 'sequence-effect':
			return `${sequenceKey}.sequence-effect.${item.i}`;
		case 'sequence-effect-prop':
			return `${sequenceKey}.sequence-effect-prop.${item.i}.${item.key}`;
		case 'keyframe':
			return `${timelineNodePathInfoToKey(item.nodePathInfo)}.keyframe.${
				item.frame
			}`;
		case 'easing':
			return `${timelineNodePathInfoToKey(item.nodePathInfo)}.easing.${
				item.segmentIndex
			}.${item.fromFrame}.${item.toFrame}`;
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
	const canSelect =
		(SELECTION_ENABLED || ENABLE_OUTLINES) &&
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const canSelectEasing =
		EASING_SELECTION_ENABLED &&
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const [selectedItems, setSelectedItems] = useState<
		readonly TimelineSelection[]
	>([]);
	const selectionAnchor = useRef<TimelineSelection | null>(null);
	const selectableItemsOrder = useRef(new Map<string, number>());
	const selectableItems = useRef(new Map<string, TimelineSelection>());
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
		if (!canSelect && !canSelectEasing) {
			setSelectedItems([]);
		}
	}, [canSelect, canSelectEasing]);

	const canSelectItem = useCallback(
		(item: TimelineSelection) =>
			canSelect || (canSelectEasing && item.type === 'easing'),
		[canSelect, canSelectEasing],
	);

	const selectedKeys = useMemo(
		() => new Set(selectedItems.map(getTimelineSelectionKey)),
		[selectedItems],
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

			setSelectedItems((currentSelectedItems) => {
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
						selectedItems: currentSelectedItems,
						anchor: selectionAnchor.current,
					},
					clickedItem: item,
					interaction,
					allSelectableItems: orderedSelectableItems,
				});
				selectionAnchor.current = nextState.anchor;
				return nextState.selectedItems;
			});
		},
		[canSelectItem],
	);

	const selectItems = useCallback(
		(items: readonly TimelineSelection[]) => {
			if (!items.every(canSelectItem)) {
				return;
			}

			selectionAnchor.current =
				items.length === 0 ? null : items[items.length - 1];
			setSelectedItems(items);
		},
		[canSelectItem],
	);

	const registerSelectableItem = useCallback((item: TimelineSelection) => {
		const key = getTimelineSelectionKey(item);
		const registrationOrder = registrationCounter.current;
		registrationCounter.current += 1;
		selectableItems.current.set(key, item);
		selectableItemsOrder.current.set(key, registrationOrder);
		return () => {
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
		selectionAnchor.current = null;
		setSelectedItems([]);
	}, []);

	const containsSelection = useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			return selectedItems.some((selected) =>
				nodePathDescendsFrom(selected.nodePathInfo, nodePathInfo),
			);
		},
		[selectedItems],
	);

	const value = useMemo(
		(): TimelineSelectionContextValue => ({
			canSelect,
			canSelectEasing,
			selectedItems,
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
			canSelectEasing,
			selectedItems,
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
	const {canSelect, canSelectEasing, getMarqueeSelection, selectItems} =
		useTimelineSelection();
	const [marqueeRect, setMarqueeRect] = useState<TimelineMarqueeRect | null>(
		null,
	);

	const onPointerDownCapture = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.button !== 0 || (!canSelect && !canSelectEasing)) {
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

			const startX = event.clientX;
			const startY = event.clientY;
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
				if (
					!hasDragged &&
					Math.max(Math.abs(clientX - startX), Math.abs(clientY - startY)) < 3
				) {
					return;
				}

				hasDragged = true;
				const rect = getNormalizedTimelineMarqueeRect({
					currentX: clientX,
					currentY: clientY,
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
		[canSelect, canSelectEasing, getMarqueeSelection, selectItems],
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
	const {canSelectEasing, isSelected, selectItem, registerSelectableItem} =
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
		selectable: canSelectEasing,
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
