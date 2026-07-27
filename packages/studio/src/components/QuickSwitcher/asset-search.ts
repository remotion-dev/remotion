import type {StaticFile} from '../../api/get-static-files';
import {
	getPreviewFileType,
	type AssetFileType,
} from '../../helpers/get-preview-file-type';

const typeFilterRegex = /(^|\s)type:([^\s]+)/gi;

export const filterAssetsByType = ({
	assets,
	query,
}: {
	readonly assets: StaticFile[];
	readonly query: string;
}): {
	readonly assets: StaticFile[];
	readonly query: string;
} => {
	const typeFilters: string[] = [];
	const queryWithoutTypeFilters = query
		.replace(typeFilterRegex, (_match, whitespace: string, type: string) => {
			typeFilters.push(type.toLowerCase());
			return whitespace;
		})
		.replace(/\s+/g, ' ')
		.trim();

	if (typeFilters.length === 0) {
		return {
			assets,
			query: queryWithoutTypeFilters,
		};
	}

	return {
		assets: assets.filter((asset) => {
			return typeFilters.includes(getPreviewFileType(asset.name));
		}),
		query: queryWithoutTypeFilters,
	};
};

const componentAssetTypes: Record<string, AssetFileType> = {
	'dev.remotion.media.Audio': 'audio',
	'dev.remotion.media.Video': 'video',
	'dev.remotion.remotion.AnimatedImage': 'image',
	'dev.remotion.remotion.Img': 'image',
};

export const getAssetSearchQueryForComponent = (
	componentIdentity: string | null,
): string => {
	if (componentIdentity === null) {
		return '';
	}

	const assetType = componentAssetTypes[componentIdentity];
	return assetType ? `type:${assetType} ` : '';
};
