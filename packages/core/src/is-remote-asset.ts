export const isRemoteAsset = (asset: string) =>
	!asset.startsWith(window.location.origin) && !asset.startsWith('data');
