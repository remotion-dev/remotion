import React from 'react';
import type { LayoutAndStyle } from '../Sequence.js';
export type LoopProps = {
    readonly durationInFrames: number;
    readonly times?: number;
    readonly name?: string;
    readonly children: React.ReactNode;
} & LayoutAndStyle;
type LoopContextType = {
    iteration: number;
    durationInFrames: number;
};
declare const useLoop: () => LoopContextType | null;
export declare const Loop: React.FC<LoopProps> & {
    useLoop: typeof useLoop;
};
export {};
