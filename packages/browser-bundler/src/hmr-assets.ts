export type BrowserHmrAsset = {
	name: string;
	content: string;
};

export type BrowserHmrBridge = {
	getManifest: (name: string) => Promise<object | undefined>;
	resolveScriptUrl: (name: string) => string;
};

const getAssetName = (nameOrUrl: string) => {
	const url = new URL(nameOrUrl, 'https://remotion.invalid');
	return url.pathname.split('/').at(-1) ?? '';
};

export const createBrowserHmrAssetManager = ({
	createObjectUrl,
	revokeObjectUrl,
}: {
	createObjectUrl: (blob: Blob) => string;
	revokeObjectUrl: (url: string) => void;
}) => {
	const assets = new Map<string, {content: string; objectUrl: string | null}>();

	const updateAssets = (newAssets: BrowserHmrAsset[]) => {
		const nextAssetNames = new Set(
			newAssets.map((asset) => getAssetName(asset.name)),
		);
		for (const [name, asset] of assets) {
			if (nextAssetNames.has(name)) {
				continue;
			}

			if (asset.objectUrl) {
				revokeObjectUrl(asset.objectUrl);
			}

			assets.delete(name);
		}

		for (const asset of newAssets) {
			const name = getAssetName(asset.name);
			const previous = assets.get(name);
			if (previous?.objectUrl) {
				revokeObjectUrl(previous.objectUrl);
			}

			assets.set(name, {content: asset.content, objectUrl: null});
		}
	};

	const bridge: BrowserHmrBridge = {
		getManifest: (name) => {
			const asset = assets.get(getAssetName(name));
			if (!asset) {
				return Promise.resolve(undefined);
			}

			return Promise.resolve(JSON.parse(asset.content) as object);
		},
		resolveScriptUrl: (name) => {
			const assetName = getAssetName(name);
			const asset = assets.get(assetName);
			if (!asset) {
				throw new Error(`Missing browser HMR asset: ${assetName}`);
			}

			asset.objectUrl ??= createObjectUrl(
				new Blob([asset.content], {type: 'text/javascript'}),
			);
			return asset.objectUrl;
		},
	};

	return {
		bridge,
		dispose: () => {
			for (const asset of assets.values()) {
				if (asset.objectUrl) {
					revokeObjectUrl(asset.objectUrl);
				}
			}

			assets.clear();
		},
		updateAssets,
	};
};
