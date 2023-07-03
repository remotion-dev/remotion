import execa from 'execa';
import {downloadFile} from './assets/download-file';
import {
	getDefaultAudioCodec,
	supportedAudioCodecs,
	validAudioCodecs,
} from './audio-codec';
import {DEFAULT_BROWSER} from './browser';
import {HeadlessBrowser} from './browser/Browser';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {callFf, dynamicLibraryPathOptions} from './call-ffmpeg';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import {chalk} from './chalk';
import {isColorSupported} from './chalk/is-color-supported';
import {checkNodeVersionAndWarnAboutRosetta} from './check-apple-silicon';
import {DEFAULT_CODEC, validCodecs} from './codec';
import {combineVideos} from './combine-videos';
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
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import {
	defaultCodecsForFileExtension,
	getFileExtensionFromCodec,
	makeFileExtensionMap,
} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {getDesiredPort} from './get-port';
import {
	DEFAULT_STILL_IMAGE_FORMAT,
	DEFAULT_VIDEO_IMAGE_FORMAT,
	validStillImageFormats,
	validVideoImageFormats,
} from './image-format';
import {isAudioCodec} from './is-audio-codec';
import {isServeUrl} from './is-serve-url';
import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from './jpeg-quality';
import {isEqualOrBelowLogLevel, isValidLogLevel, logLevels} from './log-level';
import {getLogLevel, INDENT_TOKEN, Log, setLogLevel} from './logger';
import {mimeContentType, mimeLookup} from './mime-types';
import {internalOpenBrowser, killAllBrowsers} from './open-browser';
import {parseStack} from './parse-browser-error-stack';
import * as perf from './perf';
import {DEFAULT_PIXEL_FORMAT, validPixelFormats} from './pixel-format';
import {makeOrReuseServer, prepareServer} from './prepare-server';
import {internalRenderFrames} from './render-frames';
import {internalRenderMedia} from './render-media';
import {internalRenderStill} from './render-still';
import {internalSelectComposition} from './select-composition';
import {isPathInside} from './serve-handler/is-path-inside';
import {serveStatic} from './serve-static';
import {tmpDir} from './tmp-dir';
import {
	getMaxConcurrency,
	getMinConcurrency,
	validateConcurrency,
} from './validate-concurrency';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {
	DEFAULT_OPENGL_RENDERER,
	validateOpenGlRenderer,
} from './validate-opengl-renderer';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {validateBitrate} from './validate-videobitrate';
import {
	registerErrorSymbolicationLock,
	unlockErrorSymbolicationLock,
} from './wait-for-symbolication-error-to-be-done';
export type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
export {AudioCodec} from './audio-codec';
export {Browser} from './browser';
export {BrowserExecutable} from './browser-executable';
export {BrowserLog} from './browser-log';
export type {HeadlessBrowser} from './browser/Browser';
export {Codec, CodecOrUndefined} from './codec';
export {Crf} from './crf';
export {ErrorWithStackFrame} from './error-handling/handle-javascript-exception';
export type {FfmpegOverrideFn} from './ffmpeg-override';
export {FileExtension} from './file-extensions';
export {FrameRange} from './frame-range';
export {getCompositions, GetCompositionsOptions} from './get-compositions';
export {
	ImageFormat,
	StillImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
	VideoImageFormat,
} from './image-format';
export type {LogLevel} from './log-level';
export {CancelSignal, makeCancelSignal} from './make-cancel-signal';
export {openBrowser} from './open-browser';
export type {ChromiumOptions} from './open-browser';
export {RemotionOption} from './options/option';
export {PixelFormat} from './pixel-format';
export {RemotionServer} from './prepare-server';
export {ProResProfile} from './prores-profile';
export {renderFrames, RenderFramesOptions} from './render-frames';
export {
	InternalRenderMediaOptions,
	renderMedia,
	RenderMediaOnProgress,
	RenderMediaOptions,
	SlowFrame,
	StitchingState,
} from './render-media';
export {renderStill, RenderStillOptions} from './render-still';
export {
	selectComposition,
	SelectCompositionOptions,
} from './select-composition';
export {
	stitchFramesToVideo,
	StitchFramesToVideoOptions,
} from './stitch-frames-to-video';
export {SymbolicatedStackFrame} from './symbolicate-stacktrace';
export {OnStartData, RenderFramesOutput} from './types';
export {OpenGlRenderer} from './validate-opengl-renderer';
export {validateOutputFilename} from './validate-output-filename';

export const RenderInternals = {
	ensureLocalBrowser,
	getActualConcurrency,
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
	killAllBrowsers,
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
	isAudioCodec,
	logLevels,
	isEqualOrBelowLogLevel,
	isValidLogLevel,
	perf,
	convertToPositiveFrameIndex,
	findRemotionRoot,
	validateBitrate,
	combineVideos,
	getMinConcurrency,
	getMaxConcurrency,
	getDefaultAudioCodec,
	validAudioCodecs,
	defaultFileExtensionMap,
	supportedAudioCodecs,
	makeFileExtensionMap,
	defaultCodecsForFileExtension,
	getExecutablePath,
	callFf,
	dynamicLibraryPathOptions,
	validStillImageFormats,
	validVideoImageFormats,
	DEFAULT_STILL_IMAGE_FORMAT,
	DEFAULT_VIDEO_IMAGE_FORMAT,
	DEFAULT_JPEG_QUALITY,
	chalk,
	Log,
	getLogLevel,
	setLogLevel,
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
};

// Warn of potential performance issues with Apple Silicon (M1 chip under Rosetta)
checkNodeVersionAndWarnAboutRosetta();
