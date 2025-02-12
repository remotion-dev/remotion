export declare const calculateNextFrame: ({ time, currentFrame: startFrame, playbackSpeed, fps, actualLastFrame, actualFirstFrame, framesAdvanced, shouldLoop, }: {
    time: number;
    currentFrame: number;
    playbackSpeed: number;
    fps: number;
    actualFirstFrame: number;
    actualLastFrame: number;
    framesAdvanced: number;
    shouldLoop: boolean;
}) => {
    nextFrame: number;
    framesToAdvance: number;
    hasEnded: boolean;
};
