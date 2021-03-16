import {TAsset} from 'remotion';
import {downloadAndMapAssetsToFileUrl} from './download-and-map-assets-to-file';

export const convertAssetsToFileUrls = ({
	assets,
	dir,
}: {
	assets: TAsset[][];
	dir: string;
}): Promise<TAsset[][]> => {
	return Promise.all(
		assets.map((assetsForFrame) => {
			return Promise.all(
				assetsForFrame.map((a) => {
					return downloadAndMapAssetsToFileUrl({
						localhostAsset: a,
						webpackBundle: dir,
					});
				})
			);
		})
	);
};
