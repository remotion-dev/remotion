import {
	DragAndDropInternals,
	type ComponentDragData,
	type CompositionDragData,
	type DragPreviewMetadata,
} from '@remotion/drag-and-drop';
import {hasRemoteAssetDragData} from '../helpers/remote-asset-drag';

export const isFileDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes('Files');
};

const isRemotionDragEvent = (
	event: DragEvent,
	type: DragPreviewMetadata['type'],
) => {
	return (
		DragAndDropInternals.getDragPreviewMetadata(event.dataTransfer?.types ?? [])
			?.type === type
	);
};

export const isAssetDragEvent = (event: DragEvent) => {
	return isRemotionDragEvent(event, 'asset');
};

export const isComponentDragEvent = (event: DragEvent) => {
	return isRemotionDragEvent(event, 'component');
};

export const isCompositionDragEvent = (event: DragEvent) => {
	return isRemotionDragEvent(event, 'composition');
};

export const isElementDragEvent = (event: DragEvent) => {
	return isRemotionDragEvent(event, 'element');
};

export const isSfxDragEvent = (event: DragEvent) => {
	return isRemotionDragEvent(event, 'sfx');
};

export const isRemoteAssetDragEvent = (event: DragEvent): boolean => {
	return (
		!isFileDragEvent(event) &&
		!isAssetDragEvent(event) &&
		!isCompositionDragEvent(event) &&
		!isComponentDragEvent(event) &&
		!isElementDragEvent(event) &&
		!isSfxDragEvent(event) &&
		hasRemoteAssetDragData(event.dataTransfer)
	);
};

export const isSupportedDropEvent = (event: DragEvent): boolean => {
	return (
		isFileDragEvent(event) ||
		isAssetDragEvent(event) ||
		isCompositionDragEvent(event) ||
		isComponentDragEvent(event) ||
		isElementDragEvent(event) ||
		isSfxDragEvent(event) ||
		isRemoteAssetDragEvent(event)
	);
};

export const getAssetDragPath = (event: DragEvent): string | null => {
	const parsed = event.dataTransfer
		? DragAndDropInternals.parseDragData(event.dataTransfer)
		: null;
	return parsed?.type === 'asset' ? parsed.data.assetPath : null;
};

export const getCompositionDragData = (
	event: DragEvent,
): CompositionDragData | null => {
	const parsed = event.dataTransfer
		? DragAndDropInternals.parseDragData(event.dataTransfer)
		: null;
	return parsed?.type === 'composition' ? parsed.data : null;
};

export const getComponentDragData = (
	event: DragEvent,
): ComponentDragData | null => {
	const parsed = event.dataTransfer
		? DragAndDropInternals.parseDragData(event.dataTransfer)
		: null;
	return parsed?.type === 'component' ? parsed.data : null;
};

export const getSfxDragUrl = (event: DragEvent): string | null => {
	const parsed = event.dataTransfer
		? DragAndDropInternals.parseDragData(event.dataTransfer)
		: null;
	return parsed?.type === 'sfx' ? parsed.data.sfx.url : null;
};
