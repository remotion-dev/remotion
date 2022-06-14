export type RenderCleanupFn = () => Promise<void>;
export type AddRenderCleanupFunction = (cleanup: RenderCleanupFn) => void;
