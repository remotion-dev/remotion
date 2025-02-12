export declare const useMediaStartsAt: () => number;
export type LoopVolumeCurveBehavior = 'repeat' | 'extend';
/**
 * When passing a function as the prop for `volume`,
 * we calculate the way more intuitive value for currentFrame
 */
export declare const useFrameForVolumeProp: (behavior: LoopVolumeCurveBehavior) => number;
