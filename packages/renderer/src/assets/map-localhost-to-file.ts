import path from 'path';
import {TAsset} from 'remotion';

export const mapLocalhostAssetToFile = ({
	localhostAsset,
	webpackBundle,
}: {
	localhostAsset: TAsset;
	webpackBundle: string;
}): TAsset => {
	const {pathname} = new URL(localhostAsset.src);
	const newSrc = path.join(webpackBundle, pathname);
	return {
		...localhostAsset,
		src: 'file://' + newSrc,
	};
};
