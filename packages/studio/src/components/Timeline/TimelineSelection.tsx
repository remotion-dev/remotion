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
import {
	EditorShowOutlinesContext,
	ENABLE_OUTLINES as ENABLE_OUTLINES_FLAG,
} from '../../state/editor-outlines';
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
export {ENABLE_OUTLINES} from '../../state/editor-outlines';

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
	  });

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

const getTimelineSelectionType = (item: TimelineSelection) => item.type;

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
		const sameTypeItems = selectedItems.filter(
			(item) => getTimelineSelectionType(item) === clickedType,
		);
		const existingKeySet = new Set(sameTypeItems.map(getTimelineSelectionKey));
		if (existingKeySet.has(clickedKey)) {
			const toggledSelection = sameTypeItems.filter(
				(item) => getTimelineSelectionKey(item) !== clickedKey,
			);
			return {
				selectedItems: toggledSelection,
				anchor: toggledSelection.length === 0 ? null : clickedItem,
			};
		}

		const selectableOrderMap = new Map(
			allSelectableItems
				.filter((item) => getTimelineSelectionType(item) === clickedType)
				.map((item, index) => [getTimelineSelectionKey(item), index] as const),
		);
		const extendedSelection = [...sameTypeItems, clickedItem].sort((a, b) => {
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

const getTimelineSelectionKey = (item: TimelineSelection): string => {
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
	const {editorShowOutlines} = useContext(EditorShowOutlinesContext);
	const canSelect =
		(SELECTION_ENABLED || (ENABLE_OUTLINES_FLAG && editorShowOutlines)) &&
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const [selectedItems, setSelectedItems] = useState<
		readonly TimelineSelection[]
	>([]);
	const selectionAnchor = useRef<TimelineSelection | null>(null);
	const selectableItemsOrder = useRef(new Map<string, number>());
	const selectableItems = useRef(new Map<string, TimelineSelection>());
	const registrationCounter = useRef(0);

	useEffect(() => {
		if (!canSelect) {
			setSelectedItems([]);
		}
	}, [canSelect]);

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
			if (!canSelect) {
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
		[canSelect],
	);

	const selectItems = useCallback(
		(items: readonly TimelineSelection[]) => {
			if (!canSelect) {
				return;
			}

			selectionAnchor.current =
				items.length === 0 ? null : items[items.length - 1];
			setSelectedItems(items);
		},
		[canSelect],
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
			selectedItems,
			isSelected,
			selectItem,
			selectItems,
			registerSelectableItem,
			containsSelection,
			clearSelection,
		}),
		[
			canSelect,
			selectedItems,
			isSelected,
			selectItem,
			selectItems,
			registerSelectableItem,
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

export const useCurrentTimelineSelectionStateAsRef = () => {
	const currentSelection = useContext(CurrentTimelineSelectionContext);
	if (currentSelection === null) {
		throw new Error(
			'useCurrentTimelineSelectionStateAsRef must be used inside TimelineSelectionProvider',
		);
	}

	return currentSelection;
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
		selected,
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
