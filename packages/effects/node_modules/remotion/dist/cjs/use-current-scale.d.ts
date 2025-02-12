import React from 'react';
type Size = {
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
export type CurrentScaleContextType = {
    type: 'scale';
    scale: number;
} | {
    type: 'canvas-size';
    canvasSize: Size;
};
export declare const CurrentScaleContext: React.Context<CurrentScaleContextType | null>;
type Options = {
    dontThrowIfOutsideOfRemotion: boolean;
};
export type Translation = {
    x: number;
    y: number;
};
export type PreviewSize = {
    size: number | 'auto';
    translation: Translation;
};
export type PreviewSizeCtx = {
    size: PreviewSize;
    setSize: (cb: (oldSize: PreviewSize) => PreviewSize) => void;
};
export declare const PreviewSizeContext: React.Context<PreviewSizeCtx>;
export declare const calculateScale: ({ canvasSize, compositionHeight, compositionWidth, previewSize, }: {
    previewSize: PreviewSize["size"];
    compositionWidth: number;
    compositionHeight: number;
    canvasSize: {
        width: number;
        height: number;
    };
}) => number;
export declare const useCurrentScale: (options?: Options) => number;
export {};
