import {
	StudioProtocolInternals,
	type ElementDragData,
} from '@remotion/studio-protocol';

export const mayHaveElementDragData = (dataTransfer: DataTransfer | null) => {
	const types = dataTransfer?.types ?? [];
	const metadata = StudioProtocolInternals.getDragPreviewMetadata(types);
	if (metadata !== null) {
		return metadata.type === 'element';
	}

	// Safari only exposes text/plain for cross-origin Element drags. Its
	// contents cannot be validated until drop, so allow a tentative dragover.
	// getElementDragData still validates the payload before installation.
	return Array.from(types).includes('text/plain');
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
