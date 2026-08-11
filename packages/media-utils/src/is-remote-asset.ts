export const isRemoteAsset = (asset: string) =>
	!asset.startsWith(window.origin) && !asset.startsWith('data');
