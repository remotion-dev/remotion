import {
	getDragPreviewMetadata,
	parseDragData,
	type ElementDragData,
} from '@remotion/drag-and-drop';

export const hasElementDragType = (dataTransfer: DataTransfer | null) => {
	return getDragPreviewMetadata(dataTransfer?.types ?? [])?.type === 'element';
};

export const getElementDragData = (
	dataTransfer: DataTransfer | null,
): ElementDragData | null => {
	if (!dataTransfer) {
		return null;
	}

	const parsed = parseDragData(dataTransfer);
	return parsed?.type === 'element' ? parsed.data : null;
};
