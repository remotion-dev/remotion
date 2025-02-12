"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureSpring = measureSpring;
const validate_fps_js_1 = require("../validation/validate-fps.js");
const spring_utils_js_1 = require("./spring-utils.js");
const cache = new Map();
/*
 * @description Based on a spring() configuration and the frame rate, return how long it takes for a spring animation to settle.
 * @see [Documentation](https://remotion.dev/docs/measure-spring)
 */
function measureSpring({ fps, config = {}, threshold = 0.005, }) {
    if (typeof threshold !== 'number') {
        throw new TypeError(`threshold must be a number, got ${threshold} of type ${typeof threshold}`);
    }
    if (threshold === 0) {
        return Infinity;
    }
    if (threshold === 1) {
        return 0;
    }
    if (isNaN(threshold)) {
        throw new TypeError('Threshold is NaN');
    }
    if (!Number.isFinite(threshold)) {
        throw new TypeError('Threshold is not finite');
    }
    if (threshold < 0) {
        throw new TypeError('Threshold is below 0');
    }
    const cacheKey = [
        fps,
        config.damping,
        config.mass,
        config.overshootClamping,
        config.stiffness,
        threshold,
    ].join('-');
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    (0, validate_fps_js_1.validateFps)(fps, 'to the measureSpring() function', false);
    let frame = 0;
    let finishedFrame = 0;
    const calc = () => {
        return (0, spring_utils_js_1.springCalculation)({
            fps,
            frame,
            config,
        });
    };
    let animation = calc();
    const calcDifference = () => {
        return Math.abs(animation.current - animation.toValue);
    };
    let difference = calcDifference();
    while (difference >= threshold) {
        frame++;
        animation = calc();
        difference = calcDifference();
    }
    // Since spring is bouncy, just because it's under the threshold we
    // cannot be sure it's done. We need to animate further until it stays in the
    // threshold for, say, 20 frames.
    finishedFrame = frame;
    for (let i = 0; i < 20; i++) {
        frame++;
        animation = calc();
        difference = calcDifference();
        if (difference >= threshold) {
            i = 0;
            finishedFrame = frame + 1;
        }
    }
    cache.set(cacheKey, finishedFrame);
    return finishedFrame;
}
