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
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';

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

export const TIMELINE_SELECTED_TRACK_HIGHLIGHT_STYLE: CSSProperties = {
	backgroundColor: TIMELINE_SELECTED_BACKGROUND,
	bottom: 0,
	left: -TIMELINE_PADDING,
	pointerEvents: 'none',
	position: 'absolute',
	right: -TIMELINE_PADDING,
	top: 0,
};

export const SELECTION_ENABLED = true;

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
	readonly isSelected: (item: TimelineSelection) => boolean;
	readonly selectItem: (item: TimelineSelection) => void;
	readonly containsSelection: (nodePathInfo: SequenceNodePathInfo) => boolean;
	readonly clearSelection: () => void;
};

const TimelineSelectionContext = createContext<TimelineSelectionContextValue>({
	canSelect: false,
	isSelected: () => false,
	selectItem: () => undefined,
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

export const TimelineSelectionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canSelect =
		SELECTION_ENABLED &&
		previewServerState.type === 'connected' &&
		!window.remotion_isReadOnlyStudio;
	const [selectedItem, setSelectedItem] = useState<TimelineSelection | null>(
		null,
	);

	useEffect(() => {
		if (!canSelect) {
			setSelectedItem(null);
		}
	}, [canSelect]);

	const isSelected = useCallback(
		(item: TimelineSelection) => {
			return selectedItem === null
				? false
				: getTimelineSelectionKey(selectedItem) ===
						getTimelineSelectionKey(item);
		},
		[selectedItem],
	);

	const selectItem = useCallback(
		(item: TimelineSelection) => {
			if (!canSelect) {
				return;
			}

			setSelectedItem(item);
		},
		[canSelect],
	);

	const clearSelection = useCallback(() => {
		setSelectedItem(null);
	}, []);

	const containsSelection = useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			if (selectedItem === null) {
				return false;
			}

			const selectedNodePath = selectedItem.nodePathInfo;

			if (
				stringifySequenceExpandedRowKey(
					selectedNodePath.sequenceSubscriptionKey,
				) !==
				stringifySequenceExpandedRowKey(nodePathInfo.sequenceSubscriptionKey)
			) {
				return false;
			}

			if (selectedNodePath.index !== nodePathInfo.index) {
				return false;
			}

			// Selection must be strictly deeper than this node (i.e. a descendant),
			// not the same row.
			if (
				selectedNodePath.auxiliaryKeys.length <=
				nodePathInfo.auxiliaryKeys.length
			) {
				return false;
			}

			return nodePathInfo.auxiliaryKeys.every(
				(key, i) => selectedNodePath.auxiliaryKeys[i] === key,
			);
		},
		[selectedItem],
	);

	const value = useMemo(
		(): TimelineSelectionContextValue => ({
			canSelect,
			isSelected,
			selectItem,
			containsSelection,
			clearSelection,
		}),
		[canSelect, isSelected, selectItem, containsSelection, clearSelection],
	);

	return (
		<TimelineSelectionContext.Provider value={value}>
			{children}
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
