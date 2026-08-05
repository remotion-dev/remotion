import {isRecord} from './validation';

export type AssetDragData = {
	type: 'remotion-asset';
	version: 1;
	assetPath: string;
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
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-asset' ||
			parsed.version !== 1 ||
			typeof parsed.assetPath !== 'string' ||
			parsed.assetPath.length === 0
		) {
			return null;
		}

		return makeAssetDragData(parsed.assetPath);
	} catch {
		return null;
	}
};
