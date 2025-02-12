export type Size = {
    width: number;
    height: number;
    left: number;
    top: number;
    windowSize: {
        width: number;
        height: number;
    };
    refresh: () => void;
};
export declare const updateAllElementsSizes: () => void;
export declare const useElementSize: (ref: React.RefObject<HTMLElement | null>, options: {
    triggerOnWindowResize: boolean;
    shouldApplyCssTransforms: boolean;
}) => Size | null;
