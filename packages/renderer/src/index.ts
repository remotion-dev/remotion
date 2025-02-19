import execa from 'execa';
import {downloadFile} from './assets/download-file';
import {DEFAULT_BROWSER} from './browser';
import {HeadlessBrowser} from './browser/Browser';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {callFf} from './call-ffmpeg';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import {chalk} from './chalk';
import {isColorSupported} from './chalk/is-color-supported';
import {checkRuntimeVersion} from './check-version-requirements';
import {DEFAULT_CODEC, validCodecs} from './codec';
import {combineChunks} from './combine-videos';
import {getExecutablePath} from './compositor/get-executable-path';
import {convertToPositiveFrameIndex} from './convert-to-positive-frame-index';
import {deleteDirectory} from './delete-directory';
import {ensureOutputDirectory} from './ensure-output-directory';
import {symbolicateError} from './error-handling/symbolicate-error';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {defaultFileExtensionMap} from './file-extensions';
import {findRemotionRoot} from './find-closest-package-json';
import {validateFrameRange} from './frame-range';
import {internalGetCompositions} from './get-compositions';
import {resolveConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';

import {
	defaultCodecsForFileExtension,
	getFileExtensionFromCodec,
	makeFileExtensionMap,
} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import {getDesiredPort} from './get-port';
import {
	DEFAULT_STILL_IMAGE_FORMAT,
	DEFAULT_VIDEO_IMAGE_FORMAT,
	validStillImageFormats,
	validVideoImageFormats,
} from './image-format';
import {isServeUrl} from './is-serve-url';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import {isEqualOrBelowLogLevel, isValidLogLevel, logLevels} from './log-level';
import {INDENT_TOKEN, Log} from './logger';
import {mimeContentType, mimeLookup} from './mime-types';
import {internalOpenBrowser} from './open-browser';
import {
	DEFAULT_OPENGL_RENDERER,
	validOpenGlRenderers,
	validateOpenGlRenderer,
} from './options/gl';

import {parseStack} from './parse-browser-error-stack';
import * as perf from './perf';
import {DEFAULT_PIXEL_FORMAT, validPixelFormats} from './pixel-format';
import {getPortConfig, isIpV6Supported} from './port-config';
import {makeOrReuseServer, prepareServer} from './prepare-server';
import {internalRenderFrames} from './render-frames';
import {internalRenderMedia} from './render-media';
import {internalRenderStill} from './render-still';
import {internalSelectComposition} from './select-composition';
import {isPathInside} from './serve-handler/is-path-inside';
import {serveStatic} from './serve-static';
import {getChromiumGpuInformation} from './test-gpu';
import {tmpDir} from './tmp-dir';
import {
	getMaxConcurrency,
	getMinConcurrency,
	validateConcurrency,
} from './validate-concurrency';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
export type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
export {Browser} from './browser';
export {BrowserExecutable} from './browser-executable';
export {BrowserLog} from './browser-log';
export type {HeadlessBrowser} from './browser/Browser';
export {Codec, CodecOrUndefined} from './codec';
export {Crf} from './crf';
export {EnsureBrowserOptions, ensureBrowser} from './ensure-browser';
export {ErrorWithStackFrame} from './error-handling/handle-javascript-exception';
export {extractAudio} from './extract-audio';
export type {FfmpegOverrideFn} from './ffmpeg-override';
export {FileExtension} from './file-extensions';
export {FrameRange} from './frame-range';
export {GetCompositionsOptions, getCompositions} from './get-compositions';
export {SilentPart, getSilentParts} from './get-silent-parts';
export {VideoMetadata, getVideoMetadata} from './get-video-metadata';
export {
	ImageFormat,
	StillImageFormat,
	VideoImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
} from './image-format';
export type {LogLevel} from './log-level';
export {LogOptions} from './logger';
export {CancelSignal, makeCancelSignal} from './make-cancel-signal';
export {openBrowser} from './open-browser';
export type {ChromiumOptions} from './open-browser';
export {ChromeMode} from './options/chrome-mode';
export {ColorSpace} from './options/color-space';
export type {DeleteAfter} from './options/delete-after';
export {OpenGlRenderer} from './options/gl';
export {NumberOfGifLoops} from './options/number-of-gif-loops';
export {
	DownloadBrowserProgressFn,
	OnBrowserDownload,
} from './options/on-browser-download';
export {AnyRemotionOption, RemotionOption, ToOptions} from './options/option';
export {X264Preset} from './options/x264-preset';
export {PixelFormat} from './pixel-format';
export {RemotionServer} from './prepare-server';
export {ProResProfile} from './prores-profile';
export {OnArtifact, RenderFramesOptions, renderFrames} from './render-frames';
export {
	InternalRenderMediaOptions,
	RenderMediaOnProgress,
	RenderMediaOptions,
	SlowFrame,
	StitchingState,
	renderMedia,
} from './render-media';
export {RenderStillOptions, renderStill} from './render-still';
export {
	SelectCompositionOptions,
	selectComposition,
} from './select-composition';
export {EmittedArtifact} from './serialize-artifact';
export {
	StitchFramesToVideoOptions,
	stitchFramesToVideo,
} from './stitch-frames-to-video';
export {SymbolicatedStackFrame} from './symbolicate-stacktrace';
export {OnStartData, RenderFramesOutput} from './types';
export {validateOutputFilename} from './validate-output-filename';
export type {AudioCodec};

import {makeDownloadMap} from './assets/download-map';
import {codecSupportsMedia} from './codec-supports-media';
import {makeFileExecutableIfItIsNot} from './compositor/make-file-executable';
import {internalEnsureBrowser} from './ensure-browser';
import type {AudioCodec} from './options/audio-codec';
import {
	getDefaultAudioCodec,
	getExtensionFromAudioCodec,
	resolveAudioCodec,
	supportedAudioCodecs,
} from './options/audio-codec';
import {DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS} from './options/offthreadvideo-threads';
import {printUsefulErrorMessage} from './print-useful-error-message';
import {getShouldRenderAudio} from './render-has-audio';
import {toMegabytes} from './to-megabytes';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {validateBitrate} from './validate-videobitrate';
import {
	registerErrorSymbolicationLock,
	unlockErrorSymbolicationLock,
} from './wait-for-symbolication-error-to-be-done';

export const RenderInternals = {
	resolveConcurrency,
	serveStatic,
	validateEvenDimensionsWithCodec,
	getFileExtensionFromCodec,
	tmpDir,
	deleteDirectory,
	isServeUrl,
	ensureOutputDirectory,
	getRealFrameRange,
	validatePuppeteerTimeout,
	downloadFile,
	parseStack,
	symbolicateError,
	SymbolicateableError,
	getFramesToRender,
	getExtensionOfFilename,
	getDesiredPort,
	isPathInside,
	execa,
	registerErrorSymbolicationLock,
	unlockErrorSymbolicationLock,
	canUseParallelEncoding,
	mimeContentType,
	mimeLookup,
	validateConcurrency,
	validPixelFormats,
	DEFAULT_BROWSER,
	validateFrameRange,
	DEFAULT_OPENGL_RENDERER,
	validateOpenGlRenderer,
	validCodecs,
	DEFAULT_PIXEL_FORMAT,
	validateJpegQuality,
	DEFAULT_TIMEOUT,
	DEFAULT_CODEC,
	logLevels,
	isEqualOrBelowLogLevel,
	isValidLogLevel,
	perf,
	convertToPositiveFrameIndex,
	findRemotionRoot,
	validateBitrate,
	combineChunks,
	getMinConcurrency,
	getMaxConcurrency,
	getDefaultAudioCodec,
	defaultFileExtensionMap,
	supportedAudioCodecs,
	makeFileExtensionMap,
	defaultCodecsForFileExtension,
	getExecutablePath,
	callFf,
	validStillImageFormats,
	validVideoImageFormats,
	DEFAULT_STILL_IMAGE_FORMAT,
	DEFAULT_VIDEO_IMAGE_FORMAT,
	DEFAULT_JPEG_QUALITY,
	chalk,
	Log,
	INDENT_TOKEN,
	isColorSupported,
	HeadlessBrowser,
	prepareServer,
	makeOrReuseServer,
	internalRenderStill,
	internalOpenBrowser,
	internalSelectComposition,
	internalGetCompositions,
	internalRenderFrames,
	internalRenderMedia,
	validOpenGlRenderers,
	isIpV6Supported,
	getChromiumGpuInformation,
	getPortConfig,
	makeDownloadMap,
	getExtensionFromAudioCodec,
	makeFileExecutableIfItIsNot,
	resolveAudioCodec,
	getShouldRenderAudio,
	codecSupportsMedia,
	toMegabytes,
	internalEnsureBrowser,
	printUsefulErrorMessage,
	DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
};

// Warn of potential performance issues with Apple Silicon (M1 chip under Rosetta)
checkRuntimeVersion('info', false);
