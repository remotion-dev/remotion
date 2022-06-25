import React, {
	createContext,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import type {TAsset} from './CompositionManager';

export type AssetRootContext = {
	registerAsset: (asset: TAsset) => void;
	unregisterAsset: (id: string) => void;
};

export const AssetManager = createContext<AssetRootContext>({
	registerAsset: () => undefined,
	unregisterAsset: () => undefined,
});

export const AssetRoot: React.FC<{
	children: React.ReactNode;
	pageIndex: number;
}> = ({children, pageIndex}) => {
	const [assets, setAssets] = useState<TAsset[]>([]);

	const registerAsset = useCallback((asset: TAsset) => {
		setAssets((assts) => {
			return [...assts, asset];
		});
	}, []);

	const unregisterAsset = useCallback((id: string) => {
		setAssets((assts) => {
			return assts.filter((a) => a.id !== id);
		});
	}, []);

	const context: AssetRootContext = useMemo(() => {
		return {assets, registerAsset, unregisterAsset};
	}, [assets, registerAsset, unregisterAsset]);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			if (window.remotion_collectAssets === undefined) {
				window.remotion_collectAssets = [];
			}

			window.remotion_collectAssets[pageIndex] = () => {
				setAssets([]); // clear assets at next render
				return assets;
			};
		}
	}, [assets, pageIndex]);

	return (
		<AssetManager.Provider value={context}>{children}</AssetManager.Provider>
	);
};
