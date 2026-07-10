export {ASSET_DRAG_MIME_TYPE} from './drag-mime-types';

export type AssetDragData = {
	type: 'remotion-asset';
	version: 1;
	assetPath: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const makeAssetDragData = (assetPath: string): AssetDragData => {
	return {
		type: 'remotion-asset',
		version: 1,
		assetPath,
	};
};

export const parseAssetDragData = (value: string): AssetDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-asset' || parsed.version !== 1) {
			return null;
		}

		if (typeof parsed.assetPath !== 'string' || parsed.assetPath.length === 0) {
			return null;
		}

		return {
			type: 'remotion-asset',
			version: 1,
			assetPath: parsed.assetPath,
		};
	} catch {
		return null;
	}
};
