import React from 'react';
type RenderVolumeSliderProps = {
    readonly volume: number;
    readonly isVertical: boolean;
    readonly onBlur: () => void;
    readonly inputRef: React.RefObject<HTMLInputElement | null>;
    readonly setVolume: (u: number) => void;
};
export type RenderVolumeSlider = (props: RenderVolumeSliderProps) => React.ReactNode;
export declare const renderDefaultVolumeSlider: RenderVolumeSlider;
export {};
