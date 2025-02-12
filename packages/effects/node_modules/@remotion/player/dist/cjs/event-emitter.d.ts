type SeekPayload = {
    frame: number;
};
type ErrorPayload = {
    error: Error;
};
type TimeUpdateEventPayload = {
    frame: number;
};
type FrameUpdateEventPayload = {
    frame: number;
};
type RateChangeEventPayload = {
    playbackRate: number;
};
type ScaleChangeEventPayload = {
    scale: number;
};
type VolumeChangeEventPayload = {
    volume: number;
};
type FullscreenChangeEventPayload = {
    isFullscreen: boolean;
};
type MuteChangeEventPayload = {
    isMuted: boolean;
};
type WaitingEventPayload = {};
type ResumeEventPayload = {};
type PlayerStateEventMap = {
    seeked: SeekPayload;
    pause: undefined;
    play: undefined;
    ratechange: RateChangeEventPayload;
    scalechange: ScaleChangeEventPayload;
    volumechange: VolumeChangeEventPayload;
    ended: undefined;
    error: ErrorPayload;
    timeupdate: TimeUpdateEventPayload;
    frameupdate: FrameUpdateEventPayload;
    fullscreenchange: FullscreenChangeEventPayload;
    mutechange: MuteChangeEventPayload;
    waiting: WaitingEventPayload;
    resume: ResumeEventPayload;
};
type ThumbnailStateEventMap = {
    error: ErrorPayload;
    waiting: WaitingEventPayload;
    resume: ResumeEventPayload;
};
export type PlayerEventTypes = keyof PlayerStateEventMap;
export type ThumbnailEventTypes = keyof ThumbnailStateEventMap;
export type CallbackListener<T extends PlayerEventTypes> = (data: {
    detail: PlayerStateEventMap[T];
}) => void;
type PlayerListeners = {
    [EventType in PlayerEventTypes]: CallbackListener<EventType>[];
};
type ThumbnailListeners = {
    [EventType in ThumbnailEventTypes]: CallbackListener<EventType>[];
};
export declare class PlayerEmitter {
    listeners: PlayerListeners;
    addEventListener<Q extends PlayerEventTypes>(name: Q, callback: CallbackListener<Q>): void;
    removeEventListener<Q extends PlayerEventTypes>(name: Q, callback: CallbackListener<Q>): void;
    private dispatchEvent;
    dispatchSeek: (frame: number) => void;
    dispatchVolumeChange: (volume: number) => void;
    dispatchPause: () => void;
    dispatchPlay: () => void;
    dispatchEnded: () => void;
    dispatchRateChange: (playbackRate: number) => void;
    dispatchScaleChange: (scale: number) => void;
    dispatchError: (error: Error) => void;
    dispatchTimeUpdate: (event: TimeUpdateEventPayload) => void;
    dispatchFrameUpdate: (event: FrameUpdateEventPayload) => void;
    dispatchFullscreenChange: (event: FullscreenChangeEventPayload) => void;
    dispatchMuteChange: (event: MuteChangeEventPayload) => void;
    dispatchWaiting: (event: WaitingEventPayload) => void;
    dispatchResume: (event: ResumeEventPayload) => void;
}
export declare class ThumbnailEmitter {
    listeners: ThumbnailListeners;
    addEventListener<Q extends ThumbnailEventTypes>(name: Q, callback: CallbackListener<Q>): void;
    removeEventListener<Q extends ThumbnailEventTypes>(name: Q, callback: CallbackListener<Q>): void;
    private dispatchEvent;
    dispatchError: (error: Error) => void;
    dispatchWaiting: (event: WaitingEventPayload) => void;
    dispatchResume: (event: ResumeEventPayload) => void;
}
export {};
