"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureSpring = void 0;
exports.spring = spring;
const interpolate_js_1 = require("../interpolate.js");
const validate_frame_js_1 = require("../validate-frame.js");
const validate_fps_js_1 = require("../validation/validate-fps.js");
const validation_spring_duration_js_1 = require("../validation/validation-spring-duration.js");
const measure_spring_js_1 = require("./measure-spring.js");
const spring_utils_js_1 = require("./spring-utils.js");
/*
 * @description Calculates a position based on physical parameters, start and end value, and time.
 * @see [Documentation](https://www.remotion.dev/docs/spring)
 */
function spring({ frame: passedFrame, fps, config = {}, from = 0, to = 1, durationInFrames: passedDurationInFrames, durationRestThreshold, delay = 0, reverse = false, }) {
    (0, validation_spring_duration_js_1.validateSpringDuration)(passedDurationInFrames);
    (0, validate_frame_js_1.validateFrame)({
        frame: passedFrame,
        durationInFrames: Infinity,
        allowFloats: true,
    });
    (0, validate_fps_js_1.validateFps)(fps, 'to spring()', false);
    const needsToCalculateNaturalDuration = reverse || typeof passedDurationInFrames !== 'undefined';
    const naturalDuration = needsToCalculateNaturalDuration
        ? (0, measure_spring_js_1.measureSpring)({
            fps,
            config,
            threshold: durationRestThreshold,
        })
        : undefined;
    const naturalDurationGetter = needsToCalculateNaturalDuration
        ? {
            get: () => naturalDuration,
        }
        : {
            get: () => {
                throw new Error('did not calculate natural duration, this is an error with Remotion. Please report');
            },
        };
    const reverseProcessed = reverse
        ? (passedDurationInFrames !== null && passedDurationInFrames !== void 0 ? passedDurationInFrames : naturalDurationGetter.get()) - passedFrame
        : passedFrame;
    const delayProcessed = reverseProcessed + (reverse ? delay : -delay);
    const durationProcessed = passedDurationInFrames === undefined
        ? delayProcessed
        : delayProcessed / (passedDurationInFrames / naturalDurationGetter.get());
    if (passedDurationInFrames && delayProcessed > passedDurationInFrames) {
        return to;
    }
    const spr = (0, spring_utils_js_1.springCalculation)({
        fps,
        frame: durationProcessed,
        config,
    });
    const inner = config.overshootClamping
        ? to >= from
            ? Math.min(spr.current, to)
            : Math.max(spr.current, to)
        : spr.current;
    const interpolated = from === 0 && to === 1 ? inner : (0, interpolate_js_1.interpolate)(inner, [0, 1], [from, to]);
    return interpolated;
}
var measure_spring_js_2 = require("./measure-spring.js");
Object.defineProperty(exports, "measureSpring", { enumerable: true, get: function () { return measure_spring_js_2.measureSpring; } });
