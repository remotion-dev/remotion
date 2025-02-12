export type MediaVolumeContextValue = {
    mediaMuted: boolean;
    mediaVolume: number;
};
export type SetMediaVolumeContextValue = {
    setMediaMuted: (u: React.SetStateAction<boolean>) => void;
    setMediaVolume: (u: number) => void;
};
export declare const MediaVolumeContext: import("react").Context<MediaVolumeContextValue>;
export declare const SetMediaVolumeContext: import("react").Context<SetMediaVolumeContextValue>;
type MediaVolumeReturnType = readonly [number, (u: number) => void];
export declare const useMediaVolumeState: () => MediaVolumeReturnType;
type MediaMutedReturnType = readonly [
    boolean,
    (u: React.SetStateAction<boolean>) => void
];
export declare const useMediaMutedState: () => MediaMutedReturnType;
export {};
