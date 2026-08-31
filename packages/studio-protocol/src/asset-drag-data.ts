import * as z from 'zod/mini';

export type AssetDragData = {
	type: 'remotion-asset';
	version: 1;
	assetPath: string;
};

const assetDragDataSchema = z.object({
	type: z.literal('remotion-asset'),
	version: z.literal(1),
	assetPath: z.string().check(z.minLength(1)),
});

export const makeAssetDragData = (assetPath: string): AssetDragData => {
	return {
		type: 'remotion-asset',
		version: 1,
		assetPath,
	};
};

export const parseAssetDragData = (value: string): AssetDragData | null => {
	try {
		const parsed = z.safeParse(assetDragDataSchema, JSON.parse(value));
		return parsed.success ? makeAssetDragData(parsed.data.assetPath) : null;
	} catch {
		return null;
	}
};
