type AnimationNode = {
    lastTimestamp: number;
    toValue: number;
    current: number;
    velocity: number;
    prevPosition?: number;
};
export type SpringConfig = {
    damping: number;
    mass: number;
    stiffness: number;
    overshootClamping: boolean;
};
export declare function springCalculation({ frame, fps, config, }: {
    frame: number;
    fps: number;
    config?: Partial<SpringConfig>;
}): AnimationNode;
export {};
