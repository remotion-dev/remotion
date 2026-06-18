export type {
	ArtifactAsset,
	AudioOrVideoAsset,
	InlineAudioAsset,
	TRenderAsset,
} from './CompositionManager';
export type {DownloadBehavior} from './download-behavior';
export {
	assertValidInterpolateEasingOption,
	assertValidInterpolatePosterizeOption,
	interpolate,
} from './interpolate';
export type {
	EasingFunction,
	ExtrapolateType,
	InterpolateOptions,
} from './interpolate';
export {random} from './random.js';
export type {RandomSeed} from './random.js';
export type {VideoConfig} from './video-config';

import {
	DELAY_RENDER_CALLSTACK_TOKEN,
	DELAY_RENDER_CLEAR_TOKEN,
	DELAY_RENDER_RETRIES_LEFT,
	DELAY_RENDER_RETRY_TOKEN,
} from './delay-render';
import {findPropsToDelete} from './find-props-to-delete';
import {
	deserializeJSONWithSpecialTypes,
	serializeJSONWithSpecialTypes,
} from './input-props-serialization';
import {DATE_TOKEN, FILE_TOKEN} from './input-props-serialization.js';
import {sequenceSchema} from './interactivity-schema';
import {colorNames, processColor} from './interpolate-colors';
import {proResProfileOptions} from './prores-profile';
import {parseScaleValue, serializeScaleValue} from './scale-value';
import {truthy} from './truthy';
import {ENABLE_V5_BREAKING_CHANGES} from './v5-flag';
import {validateFrame} from './validate-frame';
import {validateCodec} from './validation/validate-default-codec';
import {validateDefaultAndInputProps} from './validation/validate-default-props';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';
import {getExpectedMediaFrameUncorrected} from './video/get-current-time';
import {getOffthreadVideoSource} from './video/offthread-video-source';

export const NoReactInternals = {
	processColor,
	truthy,
	validateFps,
	validateDimension,
	validateDurationInFrames,
	validateDefaultAndInputProps,
	validateFrame,
	serializeJSONWithSpecialTypes,
	bundleName: 'bundle.js',
	bundleMapName: 'bundle.js.map',
	deserializeJSONWithSpecialTypes,
	DELAY_RENDER_CALLSTACK_TOKEN,
	DELAY_RENDER_RETRY_TOKEN,
	DELAY_RENDER_CLEAR_TOKEN,
	DELAY_RENDER_ATTEMPT_TOKEN: DELAY_RENDER_RETRIES_LEFT,
	getOffthreadVideoSource,
	getExpectedMediaFrameUncorrected,
	ENABLE_V5_BREAKING_CHANGES,
	MIN_NODE_VERSION: ENABLE_V5_BREAKING_CHANGES ? 18 : 16,
	MIN_BUN_VERSION: ENABLE_V5_BREAKING_CHANGES ? '1.1.3' : '1.0.3',
	colorNames,
	DATE_TOKEN,
	FILE_TOKEN,
	validateCodec,
	proResProfileOptions,
	findPropsToDelete,
	sequenceSchema,
	parseScaleValue,
	serializeScaleValue,
};
