import React from 'react';
import type { AnimatedImageFillMode } from './props';
type Props = {
    readonly width?: number;
    readonly height?: number;
    readonly fit: AnimatedImageFillMode;
    readonly className?: string;
    readonly style?: React.CSSProperties;
};
export type AnimatedImageCanvasRef = {
    readonly draw: (imageData: VideoFrame) => void;
    readonly getCanvas: () => HTMLCanvasElement | null;
    clear: () => void;
};
export declare const Canvas: React.ForwardRefExoticComponent<Props & React.RefAttributes<AnimatedImageCanvasRef>>;
export {};
