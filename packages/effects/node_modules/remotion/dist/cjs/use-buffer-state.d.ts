export type DelayPlaybackHandle = {
    unblock: () => void;
};
type UseBufferState = {
    delayPlayback: () => DelayPlaybackHandle;
};
export declare const useBufferState: () => UseBufferState;
export {};
