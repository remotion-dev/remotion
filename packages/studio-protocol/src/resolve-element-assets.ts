import {maxElementAssetBytes, type ElementAsset} from './element-drag-data';

export const resolveElementAssets = async ({
	assets,
	downloadAsset,
}: {
	assets: readonly ElementAsset[];
	downloadAsset: (options: {url: URL; maxSize: number}) => Promise<Uint8Array>;
}) => {
	const resolved: Array<{path: string; contents: Uint8Array}> = [];
	let totalBytes = 0;
	for (const asset of assets) {
		const contents =
			asset.type === 'base64'
				? Uint8Array.from(atob(asset.data), (character) =>
						character.charCodeAt(0),
					)
				: await downloadAsset({
						url: new URL(asset.url),
						maxSize: maxElementAssetBytes - totalBytes,
					});
		totalBytes += contents.byteLength;
		if (totalBytes > maxElementAssetBytes) {
			throw new Error('Element assets exceed the 50MB aggregate limit');
		}

		resolved.push({path: asset.path, contents});
	}

	return resolved;
};
