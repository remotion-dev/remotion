export const ASSET_DRAG_MIME_TYPE = 'application/vnd.remotion.asset+json';
export const COMPONENT_DRAG_MIME_TYPE =
	'application/vnd.remotion.component+json';
export const COMPOSITION_DRAG_MIME_TYPE =
	'application/vnd.remotion.composition+json';
export const EFFECT_DRAG_MIME_TYPE = 'application/vnd.remotion.effect+json';
export const ELEMENT_DRAG_MIME_TYPE = 'application/vnd.remotion.element+json';
export const SFX_DRAG_MIME_TYPE = 'application/vnd.remotion.sfx+json';

export const REMOTION_DRAG_MIME_TYPES = [
	ASSET_DRAG_MIME_TYPE,
	COMPONENT_DRAG_MIME_TYPE,
	COMPOSITION_DRAG_MIME_TYPE,
	EFFECT_DRAG_MIME_TYPE,
	ELEMENT_DRAG_MIME_TYPE,
	SFX_DRAG_MIME_TYPE,
] as const;

export type RemotionDragMimeType = (typeof REMOTION_DRAG_MIME_TYPES)[number];

export const isRemotionDragMimeType = (
	type: string,
): type is RemotionDragMimeType => {
	return REMOTION_DRAG_MIME_TYPES.some((mimeType) => mimeType === type);
};
