import {
	createContext,
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
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

export type CollectAssetsRef = {
	collectAssets: () => TRenderAsset[];
};

export const RenderAssetManagerProvider: React.FC<{
	children: React.ReactNode;
	collectAssets: null | React.RefObject<CollectAssetsRef | null>;
}> = ({children, collectAssets}) => {
	const [renderAssets, setRenderAssets] = useState<TRenderAsset[]>([]);
	const renderAssetsRef = useRef<TRenderAsset[]>([]);

	const registerRenderAsset = useCallback((renderAsset: TRenderAsset) => {
		validateRenderAsset(renderAsset);
		renderAssetsRef.current = [...renderAssetsRef.current, renderAsset];
		setRenderAssets(renderAssetsRef.current);
	}, []);

	if (collectAssets) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useImperativeHandle(collectAssets, () => {
			return {
				collectAssets: () => {
					const assets = renderAssetsRef.current;
					renderAssetsRef.current = [];
					setRenderAssets([]);
					return assets;
				},
			};
		}, []);
	}

	const unregisterRenderAsset = useCallback((id: string) => {
		renderAssetsRef.current = renderAssetsRef.current.filter(
			(a) => a.id !== id,
		);
		setRenderAssets(renderAssetsRef.current);
	}, []);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectAssets = () => {
				const assets = renderAssetsRef.current;
				renderAssetsRef.current = [];
				setRenderAssets([]);
				return assets;
			};
		}
	}, []);

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
