import {
	DragAndDropInternals,
	type ElementDragData,
} from '@remotion/drag-and-drop';

export const hasElementDragType = (dataTransfer: DataTransfer | null) => {
	return (
		DragAndDropInternals.getDragPreviewMetadata(dataTransfer?.types ?? [])
			?.type === 'element'
	);
};

export const getElementDragData = (
	dataTransfer: DataTransfer | null,
): ElementDragData | null => {
	if (!dataTransfer) {
		return null;
	}

	const parsed = DragAndDropInternals.parseDragData(dataTransfer);
	return parsed?.type === 'element' ? parsed.data : null;
};
