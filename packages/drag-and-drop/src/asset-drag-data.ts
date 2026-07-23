import {
	parseDragPreviewMetadataValue,
	type AssetDragPreviewMetadata,
} from './drag-preview-metadata';
import {isRecord} from './validation';

export type AssetDragData = {
	type: 'remotion-asset';
	version: 1;
	assetPath: string;
	preview: AssetDragPreviewMetadata;
};

export const makeAssetDragData = (
	assetPath: string,
	metadata: Omit<AssetDragPreviewMetadata, 'kind'> = {},
): AssetDragData => {
	const preview = parseDragPreviewMetadataValue({
		kind: 'asset',
		...metadata,
	});
	if (preview === null || preview.kind !== 'asset') {
		throw new TypeError('Invalid asset drag preview metadata');
	}

	return {
		type: 'remotion-asset',
		version: 1,
		assetPath,
		preview,
	};
};

export const parseAssetDragData = (value: string): AssetDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-asset' ||
			parsed.version !== 1 ||
			typeof parsed.assetPath !== 'string' ||
			parsed.assetPath.length === 0 ||
			(parsed.preview !== undefined &&
				parseDragPreviewMetadataValue(parsed.preview)?.kind !== 'asset')
		) {
			return null;
		}

		const preview =
			parsed.preview === undefined
				? {kind: 'asset' as const}
				: parseDragPreviewMetadataValue(parsed.preview);
		if (preview === null || preview.kind !== 'asset') {
			return null;
		}

		return makeAssetDragData(parsed.assetPath, {
			width: preview.width,
			height: preview.height,
			durationInSeconds: preview.durationInSeconds,
		});
	} catch {
		return null;
	}
};
