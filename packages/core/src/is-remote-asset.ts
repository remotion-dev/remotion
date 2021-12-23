// TODO: Can be removed in 3.0 branch

export const isRemoteAsset = (asset: string, dataURLIsRemoteObject: boolean) =>
	!asset.startsWith(window.location.origin) ||
	(asset.startsWith('data') && dataURLIsRemoteObject);
