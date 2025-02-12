import type { PropsWithChildren } from 'react';
import type { AnyComposition } from './CompositionManager.js';
import type { VideoConfig } from './video-config.js';
type ResolveCompositionConfigContect = Record<string, VideoConfigState | undefined>;
export declare const ResolveCompositionContext: import("react").Context<ResolveCompositionConfigContect | null>;
export declare const resolveCompositionsRef: import("react").RefObject<{
    setCurrentRenderModalComposition: (compositionId: string | null) => void;
    reloadCurrentlySelectedComposition: () => void;
} | null>;
type VideoConfigState = {
    type: 'loading';
} | {
    type: 'success';
    result: VideoConfig;
} | {
    type: 'success-and-refreshing';
    result: VideoConfig;
} | {
    type: 'error';
    error: Error;
};
export declare const needsResolution: (composition: AnyComposition) => boolean;
export declare const PROPS_UPDATED_EXTERNALLY = "remotion.propsUpdatedExternally";
export declare const ResolveCompositionConfig: React.FC<PropsWithChildren<{
    children: React.ReactNode;
}>>;
export declare const useResolvedVideoConfig: (preferredCompositionId: string | null) => VideoConfigState | null;
export {};
