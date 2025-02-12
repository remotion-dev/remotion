import React from 'react';
import type { RenderVolumeSlider } from './render-volume-slider.js';
export declare const VOLUME_SLIDER_WIDTH = 100;
export type RenderMuteButton = (props: {
    muted: boolean;
    volume: number;
}) => React.ReactNode;
export declare const MediaVolumeSlider: React.FC<{
    readonly displayVerticalVolumeSlider: boolean;
    readonly renderMuteButton: RenderMuteButton | null;
    readonly renderVolumeSlider: RenderVolumeSlider | null;
}>;
