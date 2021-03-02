import {
	CompositionManager,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager';
import {
	DEFAULT_BROWSER,
	FEATURE_FLAG_FIREFOX_SUPPORT,
	getBrowser,
} from './config/browser';
import {getBrowserExecutable} from './config/browser-executable';
import {
	DEFAULT_CODEC,
	getFinalOutputCodec,
	getOutputCodecOrUndefined,
} from './config/codec';
import {getConcurrency} from './config/concurrency';
import {
	getActualCrf,
	getDefaultCrfForCodec,
	validateSelectedCrfAndCodecCombination,
} from './config/crf';
import {
	getUserPreferredImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
} from './config/image-format';
import {getShouldOutputImageSequence} from './config/image-sequence';
import {
	getWebpackOverrideFn,
	WebpackOverrideFn,
} from './config/override-webpack';
import {getShouldOverwrite} from './config/overwrite';
import {
	DEFAULT_PIXEL_FORMAT,
	getPixelFormat,
	validateSelectedPixelFormatAndCodecCombination,
} from './config/pixel-format';
import {getQuality} from './config/quality';
import {getFrameRange} from './config/range';
import * as perf from './perf';
import {getCompositionName, getIsEvaluation, getRoot} from './register-root';
import {RemotionRoot} from './RemotionRoot';
import * as Timeline from './timeline-position-state';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {useVideo} from './use-video';

// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
export const Internals = {
	perf,
	useUnsafeVideoConfig,
	Timeline,
	CompositionManager,
	RemotionRoot,
	useVideo,
	getRoot,
	getBrowserExecutable,
	getCompositionName,
	getIsEvaluation,
	getPixelFormat,
	getConcurrency,
	getFrameRange,
	getShouldOverwrite,
	getOutputCodecOrUndefined,
	getWebpackOverrideFn,
	getQuality,
	getShouldOutputImageSequence,
	validateSelectedCrfAndCodecCombination,
	getFinalOutputCodec,
	DEFAULT_CODEC,
	DEFAULT_PIXEL_FORMAT,
	FEATURE_FLAG_FIREFOX_SUPPORT,
	getBrowser,
	DEFAULT_BROWSER,
	getDefaultCrfForCodec,
	getActualCrf,
	getUserPreferredImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
	validateSelectedPixelFormatAndCodecCombination,
};

export type {
	TComposition,
	Timeline,
	TCompMetadata,
	TSequence,
	WebpackOverrideFn,
};
