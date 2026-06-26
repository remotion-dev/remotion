import {
	ELEMENT_DRAG_MIME_TYPE,
	parseElementDragData,
	type ElementDragData,
} from '@remotion/studio-shared';

export const hasElementDragType = (dataTransfer: DataTransfer | null) => {
	return Array.from(dataTransfer?.types ?? []).includes(ELEMENT_DRAG_MIME_TYPE);
};

export const getElementDragData = (
	dataTransfer: DataTransfer | null,
): ElementDragData | null => {
	if (!dataTransfer) {
		return null;
	}

	for (const type of [
		ELEMENT_DRAG_MIME_TYPE,
		'application/json',
		'text/plain',
	]) {
		const raw = dataTransfer.getData(type);
		if (!raw) {
			continue;
		}

		const parsed = parseElementDragData(raw);
		if (parsed) {
			return parsed;
		}
	}

	return null;
};
