import {
	ASSET_DRAG_MIME_TYPE,
	COMPONENT_DRAG_MIME_TYPE,
	COMPOSITION_DRAG_MIME_TYPE,
	ELEMENT_DRAG_MIME_TYPE,
	parseAssetDragData,
	parseComponentDragData,
	parseCompositionDragData,
	parseSfxDragData,
	SFX_DRAG_MIME_TYPE,
	type ComponentDragData,
	type CompositionDragData,
} from '@remotion/studio-shared';
import {hasRemoteAssetDragData} from '../helpers/remote-asset-drag';

export const isFileDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes('Files');
};

export const isAssetDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes(
		ASSET_DRAG_MIME_TYPE,
	);
};

export const isComponentDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes(
		COMPONENT_DRAG_MIME_TYPE,
	);
};

export const isCompositionDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes(
		COMPOSITION_DRAG_MIME_TYPE,
	);
};

export const isElementDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes(
		ELEMENT_DRAG_MIME_TYPE,
	);
};

export const isSfxDragEvent = (event: DragEvent): boolean => {
	return Array.from(event.dataTransfer?.types ?? []).includes(
		SFX_DRAG_MIME_TYPE,
	);
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
	const value = event.dataTransfer?.getData(ASSET_DRAG_MIME_TYPE);
	if (!value) {
		return null;
	}

	return parseAssetDragData(value)?.assetPath ?? null;
};

export const getCompositionDragData = (
	event: DragEvent,
): CompositionDragData | null => {
	const value = event.dataTransfer?.getData(COMPOSITION_DRAG_MIME_TYPE);
	if (!value) {
		return null;
	}

	return parseCompositionDragData(value);
};

export const getComponentDragData = (
	event: DragEvent,
): ComponentDragData | null => {
	for (const type of [
		COMPONENT_DRAG_MIME_TYPE,
		'application/json',
		'text/plain',
	]) {
		const value = event.dataTransfer?.getData(type);
		if (!value) {
			continue;
		}

		const parsed = parseComponentDragData(value);
		if (parsed) {
			return parsed;
		}
	}

	return null;
};

export const getSfxDragUrl = (event: DragEvent): string | null => {
	const {dataTransfer} = event;
	if (!dataTransfer) {
		return null;
	}

	for (const type of [SFX_DRAG_MIME_TYPE, 'application/json', 'text/plain']) {
		const value = dataTransfer.getData(type);
		if (!value) {
			continue;
		}

		const parsed = parseSfxDragData(value);
		if (parsed) {
			return parsed.sfx.url;
		}
	}

	return null;
};
