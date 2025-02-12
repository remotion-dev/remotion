/**
 * @description The Easing module implements common easing functions. You can use it with the interpolate() API.
 * @see [Documentation](https://www.remotion.dev/docs/easing)
 */
export declare class Easing {
    static step0(n: number): number;
    static step1(n: number): number;
    static linear(t: number): number;
    static ease(t: number): number;
    static quad(t: number): number;
    static cubic(t: number): number;
    static poly(n: number): (t: number) => number;
    static sin(t: number): number;
    static circle(t: number): number;
    static exp(t: number): number;
    static elastic(bounciness?: number): (t: number) => number;
    static back(s?: number): (t: number) => number;
    static bounce(t: number): number;
    static bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number;
    static in(easing: (t: number) => number): (t: number) => number;
    static out(easing: (t: number) => number): (t: number) => number;
    static inOut(easing: (t: number) => number): (t: number) => number;
}
