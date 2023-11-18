import {serializeJSONWithDate} from './input-props-serialization';
import {processColor} from './interpolate-colors';
import {truthy} from './truthy';
import {validateDefaultAndInputProps} from './validation/validate-default-props';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';
export {
	EasingFunction,
	ExtrapolateType,
	interpolate,
	InterpolateOptions,
} from './interpolate';
export type {VideoConfig} from './video-config';

export const NoReactInternals = {
	processColor,
	truthy,
	validateFps,
	validateDimension,
	validateDurationInFrames,
	validateDefaultAndInputProps,
	serializeJSONWithDate,
};
