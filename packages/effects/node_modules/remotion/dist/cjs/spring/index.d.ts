import type { SpringConfig } from './spring-utils';
export declare function spring({ frame: passedFrame, fps, config, from, to, durationInFrames: passedDurationInFrames, durationRestThreshold, delay, reverse, }: {
    frame: number;
    fps: number;
    config?: Partial<SpringConfig>;
    from?: number;
    to?: number;
    durationInFrames?: number;
    durationRestThreshold?: number;
    delay?: number;
    reverse?: boolean;
}): number;
export { measureSpring } from './measure-spring.js';
export type { SpringConfig } from './spring-utils';
