import type { TRenderAsset } from './CompositionManager.js';
export type RenderAssetManagerContext = {
    registerRenderAsset: (renderAsset: TRenderAsset) => void;
    unregisterRenderAsset: (id: string) => void;
    renderAssets: TRenderAsset[];
};
export declare const RenderAssetManager: import("react").Context<RenderAssetManagerContext>;
export declare const RenderAssetManagerProvider: React.FC<{
    children: React.ReactNode;
}>;
