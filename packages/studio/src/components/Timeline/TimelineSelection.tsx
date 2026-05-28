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

export const TIMELINE_SELECTED_BACKGROUND = 'rgba(255, 255, 255, 0.1)';
export const TIMELINE_SELECTED_LABEL_BACKGROUND = '#B0B0B0';
export const TIMELINE_SELECTED_LABEL_TEXT = 'black';
export const TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING = 2;

export const getTimelineSelectedLabelStyle = (
	selected: boolean,
): CSSProperties => {
	if (!selected) {
		return {};
	}

	const padding = TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING;
	return {
		backgroundColor: TIMELINE_SELECTED_LABEL_BACKGROUND,
		marginLeft: -padding,
		marginRight: -padding,
		paddingLeft: padding,
		paddingRight: padding,
	};
};

export const getTimelineSelectedTrackHighlightStyle = (): CSSProperties => ({
	backgroundColor: TIMELINE_SELECTED_BACKGROUND,
	bottom: 0,
	left: -TIMELINE_PADDING,
	pointerEvents: 'none',
	position: 'absolute',
	right: -TIMELINE_PADDING,
	top: 0,
});

export const SELECTION_ENABLED = false;

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
};

const TimelineSelectionContext = createContext<TimelineSelectionContextValue>({
	canSelect: false,
	isSelected: () => false,
	selectItem: () => undefined,
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

	const value = useMemo(
		(): TimelineSelectionContextValue => ({
			canSelect,
			isSelected,
			selectItem,
		}),
		[canSelect, isSelected, selectItem],
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
