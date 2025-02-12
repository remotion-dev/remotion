export type ExtrapolateType = 'extend' | 'identity' | 'clamp' | 'wrap';
/**
 * @description This function allows you to map a range of values to another with a concise syntax
 * @see [Documentation](https://www.remotion.dev/docs/interpolate)
 */
export type EasingFunction = (input: number) => number;
export type InterpolateOptions = Partial<{
    easing: EasingFunction;
    extrapolateLeft: ExtrapolateType;
    extrapolateRight: ExtrapolateType;
}>;
export declare function interpolate(input: number, inputRange: readonly number[], outputRange: readonly number[], options?: InterpolateOptions): number;
