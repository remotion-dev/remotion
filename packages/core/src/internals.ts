import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from './audio/shared-audio-tags';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks';
import type {CompProps} from './Composition';
import type {
	CompositionManagerContext,
	RenderAssetInfo,
	TAsset,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager';
import {CompositionManager, compositionsRef} from './CompositionManager';
import * as AssetCompression from './compress-assets';
import {DEFAULT_BROWSER, getBrowser} from './config/browser';
import {getBrowserExecutable} from './config/browser-executable';
import {
	DEFAULT_OPENGL_RENDERER,
	getChromiumDisableWebSecurity,
	getChromiumHeadlessMode,
	getChromiumOpenGlRenderer,
	getIgnoreCertificateErrors,
} from './config/chromium-flags';
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
import {getDotEnvLocation} from './config/env-file';
import {getAndValidateEveryNthFrame} from './config/every-nth-frame';
import {
	getCustomFfmpegExecutable,
	getCustomFfprobeExecutable,
} from './config/ffmpeg-executable';
import {
	getRange,
	setFrameRangeFromCli,
	validateFrameRange,
} from './config/frame-range';
import {
	getUserPreferredImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
} from './config/image-format';
import {getShouldOutputImageSequence} from './config/image-sequence';
import * as Logging from './config/log';
import {getLoop} from './config/loop';
import {getMaxTimelineTracks} from './config/max-timeline-tracks';
import type {WebpackOverrideFn} from './config/override-webpack';
import {
	defaultOverrideFunction,
	getWebpackOverrideFn,
} from './config/override-webpack';
import {DEFAULT_OVERWRITE, getShouldOverwrite} from './config/overwrite';
import {
	DEFAULT_PIXEL_FORMAT,
	getPixelFormat,
	validateSelectedPixelFormatAndCodecCombination,
} from './config/pixel-format';
import {getServerPort} from './config/preview-server';
import type {ProResProfile} from './config/prores-profile';
import {
	getProResProfile,
	setProResProfile,
	validateSelectedCodecAndProResCombination,
} from './config/prores-profile';
import {getQuality} from './config/quality';
import {getScale} from './config/scale';
import {getStillFrame, setStillFrame} from './config/still-frame';
import {
	getCurrentPuppeteerTimeout,
	setPuppeteerTimeout,
} from './config/timeout';
import {
	DEFAULT_WEBPACK_CACHE_ENABLED,
	getWebpackCaching,
} from './config/webpack-caching';
import * as CSSUtils from './default-css';
import {DELAY_RENDER_CALLSTACK_TOKEN} from './delay-render';
import {FEATURE_FLAG_FIREFOX_SUPPORT} from './feature-flags';
import type {RemotionEnvironment} from './get-environment';
import {getRemotionEnvironment} from './get-environment';
import {getPreviewDomElement} from './get-preview-dom-element';
import {isAudioCodec} from './is-audio-codec';
import * as perf from './perf';
import {portalNode} from './portal-node';
import {getRoot, waitForRoot} from './register-root';
import {RemotionRoot} from './RemotionRoot';
import {SequenceContext} from './Sequence';
import {ENV_VARIABLES_ENV_NAME, setupEnvVariables} from './setup-env-variables';
import type {
	SetTimelineInOutContextValue,
	TimelineInOutContextValue,
} from './timeline-inout-position-state';
import * as TimelineInOutPosition from './timeline-inout-position-state';
import type {
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state';
import * as TimelinePosition from './timeline-position-state';
import {DEFAULT_PUPPETEER_TIMEOUT, setupPuppeteerTimeout} from './timeout';
import {truthy} from './truthy';
import {useAbsoluteCurrentFrame} from './use-current-frame';
import {useLazyComponent} from './use-lazy-component';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {useVideo} from './use-video';
import {
	invalidCompositionErrorMessage,
	isCompositionIdValid,
} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';
import {validateFrame} from './validation/validate-frame';
import {validateNonNullImageFormat} from './validation/validate-image-format';
import {validateOffthreadVideoImageFormat} from './validation/validate-offthreadvideo-image-format';
import type {OpenGlRenderer} from './validation/validate-opengl-renderer';
import {validateOpenGlRenderer} from './validation/validate-opengl-renderer';
import {validateQuality} from './validation/validate-quality';
import type {
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from './volume-position-state';
import {
	MediaVolumeContext,
	SetMediaVolumeContext,
	useMediaMutedState,
	useMediaVolumeState,
} from './volume-position-state';
import {
	RemotionContextProvider,
	useRemotionContexts,
} from './wrap-remotion-context';
const Timeline = {...TimelinePosition, ...TimelineInOutPosition};

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
	getCustomFfmpegExecutable,
	getCustomFfprobeExecutable,
	getPixelFormat,
	getConcurrency,
	getRange,
	getShouldOverwrite,
	getOutputCodecOrUndefined,
	getWebpackOverrideFn,
	getQuality,
	getEveryNthFrame: getAndValidateEveryNthFrame,
	getLoop,
	getScale,
	getShouldOutputImageSequence,
	validateSelectedCrfAndCodecCombination,
	getFinalOutputCodec,
	useMediaVolumeState,
	useMediaMutedState,
	DEFAULT_CODEC,
	DEFAULT_PIXEL_FORMAT,
	FEATURE_FLAG_FIREFOX_SUPPORT,
	DEFAULT_WEBPACK_CACHE_ENABLED,
	getBrowser,
	DEFAULT_BROWSER,
	getDefaultCrfForCodec,
	getActualCrf,
	setFrameRangeFromCli,
	getUserPreferredImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
	validateSelectedPixelFormatAndCodecCombination,
	validateFrameRange,
	validateNonNullImageFormat,
	getWebpackCaching,
	useLazyComponent,
	truthy,
	isAudioCodec,
	Logging,
	SequenceContext,
	useRemotionContexts,
	RemotionContextProvider,
	CSSUtils,
	setupEnvVariables,
	ENV_VARIABLES_ENV_NAME,
	getDotEnvLocation,
	getServerPort,
	MediaVolumeContext,
	SetMediaVolumeContext,
	validateDurationInFrames,
	validateFps,
	validateDimension,
	getRemotionEnvironment,
	getProResProfile,
	setProResProfile,
	validateSelectedCodecAndProResCombination,
	getMaxTimelineTracks,
	SharedAudioContext,
	SharedAudioContextProvider,
	validateQuality,
	validateFrame,
	setStillFrame,
	getStillFrame,
	invalidCompositionErrorMessage,
	isCompositionIdValid,
	DEFAULT_OVERWRITE,
	AssetCompression,
	defaultOverrideFunction,
	DEFAULT_PUPPETEER_TIMEOUT,
	setupPuppeteerTimeout,
	setPuppeteerTimeout,
	getCurrentPuppeteerTimeout,
	getChromiumDisableWebSecurity,
	getIgnoreCertificateErrors,
	validateOpenGlRenderer,
	getChromiumOpenGlRenderer,
	getChromiumHeadlessMode,
	DEFAULT_OPENGL_RENDERER,
	getPreviewDomElement,
	compositionsRef,
	DELAY_RENDER_CALLSTACK_TOKEN,
	useAbsoluteCurrentFrame,
	portalNode,
	waitForRoot,
	validateOffthreadVideoImageFormat,
	CanUseRemotionHooksProvider,
	CanUseRemotionHooks,
};

export type {
	TComposition,
	Timeline,
	TCompMetadata,
	TSequence,
	WebpackOverrideFn,
	TAsset,
	RenderAssetInfo,
	TimelineContextValue,
	SetTimelineContextValue,
	TimelineInOutContextValue,
	SetTimelineInOutContextValue,
	CompProps,
	CompositionManagerContext,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	RemotionEnvironment,
	ProResProfile,
	OpenGlRenderer,
};
