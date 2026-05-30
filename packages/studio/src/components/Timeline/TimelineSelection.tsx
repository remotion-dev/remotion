import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
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

export type TimelineSelection =
	| {
			readonly type: 'row';
			readonly nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			readonly type: 'keyframe';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly frame: number;
	  };

type TimelineSelectionContextValue = {
	readonly canSelect: boolean;
	readonly selectedItems: readonly TimelineSelection[];
	readonly isSelected: (item: TimelineSelection) => boolean;
	readonly selectItem: (item: TimelineSelection) => void;
	readonly selectItems: (items: readonly TimelineSelection[]) => void;
	readonly containsSelection: (nodePathInfo: SequenceNodePathInfo) => boolean;
	readonly clearSelection: () => void;
};

const TimelineSelectionContext = createContext<TimelineSelectionContextValue>({
	canSelect: false,
	selectedItems: [],
	isSelected: () => false,
	selectItem: () => undefined,
	selectItems: () => undefined,
	containsSelection: () => false,
	clearSelection: () => undefined,
});

const getTimelineSelectionKey = (item: TimelineSelection): string => {
	const rowKey = timelineNodePathInfoToKey(item.nodePathInfo);
	if (item.type === 'row') {
		return rowKey;
	}

	return `${rowKey}.keyframe.${item.frame}`;
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

		return [{type: 'row', nodePathInfo: track.nodePathInfo}];
	});
};

export const TimelineSelectAllKeybindings: React.FC<{
	readonly timeline: readonly TrackWithHash[];
}> = ({timeline}) => {
	const keybindings = useKeybinding();
	const {canSelect, selectItems} = useTimelineSelection();

	const selectableSequenceSelections = useMemo(
		() => getSelectableTimelineSequenceSelections(timeline),
		[timeline],
	);

	useEffect(() => {
		if (!canSelect || selectableSequenceSelections.length === 0) {
			return;
		}

		const selectAll = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'a',
			callback: () => {
				selectItems(selectableSequenceSelections);
			},
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			selectAll.unregister();
		};
	}, [canSelect, keybindings, selectableSequenceSelections, selectItems]);

	return null;
};

export const TimelineSelectionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canSelect =
		SELECTION_ENABLED &&
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const [selectedItems, setSelectedItems] = useState<
		readonly TimelineSelection[]
	>([]);

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
		(item: TimelineSelection) => {
			if (!canSelect) {
				return;
			}

			setSelectedItems([item]);
		},
		[canSelect],
	);

	const selectItems = useCallback(
		(items: readonly TimelineSelection[]) => {
			if (!canSelect) {
				return;
			}

			setSelectedItems(items);
		},
		[canSelect],
	);

	const clearSelection = useCallback(() => {
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
			containsSelection,
			clearSelection,
		}),
		[
			canSelect,
			selectedItems,
			isSelected,
			selectItem,
			selectItems,
			containsSelection,
			clearSelection,
		],
	);

	return (
		<TimelineSelectionContext.Provider value={value}>
			{children}
			<TimelineDeleteKeybindings />
		</TimelineSelectionContext.Provider>
	);
};

export const useTimelineSelection = () => {
	return useContext(TimelineSelectionContext);
};

export const useTimelineRowSelection = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection | null =>
			nodePathInfo === null ? null : {type: 'row', nodePathInfo},
		[nodePathInfo],
	);

	const selected = selectionItem === null ? false : isSelected(selectionItem);

	const onSelect = useCallback(() => {
		if (selectionItem === null) {
			return;
		}

		selectItem(selectionItem);
	}, [selectItem, selectionItem]);

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
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'keyframe',
			nodePathInfo,
			frame,
		}),
		[nodePathInfo, frame],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(() => {
		selectItem(selectionItem);
	}, [selectItem, selectionItem]);

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
