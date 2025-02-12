type Info = {
    maxTimeLabelWidth: number | null;
    displayVerticalVolumeSlider: boolean;
};
export declare const X_SPACER = 10;
export declare const X_PADDING = 12;
export declare const useVideoControlsResize: ({ allowFullscreen: allowFullScreen, playerWidth, }: {
    allowFullscreen: boolean;
    playerWidth: number;
}) => Info;
export {};
