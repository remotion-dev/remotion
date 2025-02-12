import type { RemotionAnimatedImageLoopBehavior } from './props';
export type AnimatedImageCacheItem = {
    timeInSeconds: number;
    frameIndex: number;
    frame: VideoFrame | null;
};
export type RemotionImageDecoder = {
    getFrame: (i: number, loopBehavior: RemotionAnimatedImageLoopBehavior) => Promise<AnimatedImageCacheItem | null>;
    frameCount: number;
};
export declare const decodeImage: ({ resolvedSrc, signal, currentTime, initialLoopBehavior, }: {
    resolvedSrc: string;
    signal: AbortSignal;
    currentTime: number;
    initialLoopBehavior: RemotionAnimatedImageLoopBehavior;
}) => Promise<RemotionImageDecoder>;
