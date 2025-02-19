import {
	createContext,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import type {TRenderAsset} from './CompositionManager.js';
import {validateRenderAsset} from './validation/validate-artifact.js';

export type RenderAssetManagerContext = {
	registerRenderAsset: (renderAsset: TRenderAsset) => void;
	unregisterRenderAsset: (id: string) => void;
	renderAssets: TRenderAsset[];
};

export const RenderAssetManager = createContext<RenderAssetManagerContext>({
	// Must be undefined, otherwise error in Player
	registerRenderAsset: () => undefined,
	unregisterRenderAsset: () => undefined,
	renderAssets: [],
});

export const RenderAssetManagerProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [renderAssets, setRenderAssets] = useState<TRenderAsset[]>([]);

	const registerRenderAsset = useCallback((renderAsset: TRenderAsset) => {
		validateRenderAsset(renderAsset);
		setRenderAssets((assets) => {
			return [...assets, renderAsset];
		});
	}, []);

	const unregisterRenderAsset = useCallback((id: string) => {
		setRenderAssets((assts) => {
			return assts.filter((a) => a.id !== id);
		});
	}, []);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectAssets = () => {
				setRenderAssets([]); // clear assets at next render
				return renderAssets;
			};
		}
	}, [renderAssets]);

	const contextValue: RenderAssetManagerContext = useMemo(() => {
		return {
			registerRenderAsset,
			unregisterRenderAsset,
			renderAssets,
		};
	}, [renderAssets, registerRenderAsset, unregisterRenderAsset]);

	return (
		<RenderAssetManager.Provider value={contextValue}>
			{children}
		</RenderAssetManager.Provider>
	);
};
