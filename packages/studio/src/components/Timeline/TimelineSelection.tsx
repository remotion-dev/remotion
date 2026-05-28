import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';

export const TIMELINE_SELECTED_BACKGROUND = 'rgb(160, 160, 160)';
export const TIMELINE_SELECTED_TEXT = 'black';

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
