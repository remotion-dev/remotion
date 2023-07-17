import {
	createContext,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import type {TAsset} from './CompositionManager.js';

export type AssetManagerContext = {
	registerAsset: (asset: TAsset) => void;
	unregisterAsset: (id: string) => void;
	assets: TAsset[];
};

export const AssetManager = createContext<AssetManagerContext>({
	registerAsset: () => undefined,
	unregisterAsset: () => undefined,
	assets: [],
});

export const AssetManagerProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
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

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectAssets = () => {
				setAssets([]); // clear assets at next render
				return assets;
			};
		}
	}, [assets]);

	const contextValue: AssetManagerContext = useMemo(() => {
		return {
			registerAsset,
			unregisterAsset,
			assets,
		};
	}, [assets, registerAsset, unregisterAsset]);

	return (
		<AssetManager.Provider value={contextValue}>
			{children}
		</AssetManager.Provider>
	);
};
