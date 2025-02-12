import type { ENABLE_V5_BREAKING_CHANGES } from '../v5-flag.js';
import type { SpringConfig } from './spring-utils';
type V4Props = {
    from?: number;
    to?: number;
};
type MeasureSpringProps = {
    fps: number;
    config?: Partial<SpringConfig>;
    threshold?: number;
} & (false extends typeof ENABLE_V5_BREAKING_CHANGES ? V4Props : {});
export declare function measureSpring({ fps, config, threshold, }: MeasureSpringProps): number;
export {};
