import {TAsset} from 'remotion';
import {downloadAndMapAssetsToFileUrl} from './download-and-map-assets-to-file';

export const convertAssetsToFileUrls = ({
	assets,
	downloadDir,
	onDownload,
}: {
	assets: TAsset[][];
	downloadDir: string;
	onDownload: (src: string) => void;
}): Promise<TAsset[][]> => {
	return Promise.all(
		assets.map((assetsForFrame) => {
			return Promise.all(
				assetsForFrame.map((a) => {
					return downloadAndMapAssetsToFileUrl({
						localhostAsset: a,
						downloadDir,
						onDownload,
					});
				})
			);
		})
	);
};
