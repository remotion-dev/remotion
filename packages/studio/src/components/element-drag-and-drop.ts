import {
	StudioProtocolInternals,
	type ElementDragData,
} from '@remotion/studio-protocol';

export const hasElementDragType = (dataTransfer: DataTransfer | null) => {
	return (
		StudioProtocolInternals.getDragPreviewMetadata(dataTransfer?.types ?? [])
			?.type === 'element'
	);
};

export const getElementDragData = (
	dataTransfer: DataTransfer | null,
): ElementDragData | null => {
	if (!dataTransfer) {
		return null;
	}

	const parsed = StudioProtocolInternals.parseDragData(dataTransfer);
	return parsed?.type === 'element' ? parsed.data : null;
};
