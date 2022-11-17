import execa from 'execa';
import {downloadFile} from './assets/download-file';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import {DEFAULT_BROWSER} from './browser';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import {checkNodeVersionAndWarnAboutRosetta} from './check-apple-silicon';
import {DEFAULT_CODEC, validCodecs} from './codec';
import {convertToPositiveFrameIndex} from './convert-to-positive-frame-index';
import {deleteDirectory} from './delete-directory';
import {ensureOutputDirectory} from './ensure-output-directory';
import {symbolicateError} from './error-handling/symbolicate-error';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {canExtractFramesFast} from './extract-frame-from-video';
import {
	ffmpegHasFeature,
	getExecutableBinary,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {findRemotionRoot} from './find-closest-package-json';
import {validateFrameRange} from './frame-range';
import {getActualConcurrency} from './get-concurrency';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {getDesiredPort} from './get-port';
import {validImageFormats} from './image-format';
import {isAudioCodec} from './is-audio-codec';
import {isServeUrl} from './is-serve-url';
import {isEqualOrBelowLogLevel, isValidLogLevel, logLevels} from './log-level';
import {mimeContentType, mimeLookup} from './mime-types';
import {killAllBrowsers} from './open-browser';
import {parseStack} from './parse-browser-error-stack';
import * as perf from './perf';
import {DEFAULT_PIXEL_FORMAT, validPixelFormats} from './pixel-format';
import {validateQuality} from './quality';
import {isPathInside} from './serve-handler/is-path-inside';
import {serveStatic} from './serve-static';
import {tmpDir} from './tmp-dir';
import {validateConcurrency} from './validate-concurrency';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateFfmpeg} from './validate-ffmpeg';
import {validateFrame} from './validate-frame';
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
export type {DownloadMap} from './assets/download-map';
export {Browser} from './browser';
export {BrowserExecutable} from './browser-executable';
export {BrowserLog} from './browser-log';
export {Codec, CodecOrUndefined} from './codec';
export {combineVideos} from './combine-videos';
export {Crf} from './crf';
export {
	ensureFfmpeg,
	EnsureFfmpegOptions,
	ensureFfprobe,
} from './ensure-ffmpeg';
export {ErrorWithStackFrame} from './error-handling/handle-javascript-exception';
export {FfmpegExecutable} from './ffmpeg-executable';
export {FfmpegVersion} from './ffmpeg-flags';
export type {FfmpegOverrideFn} from './ffmpeg-override';
export {FrameRange} from './frame-range';
export {getCompositions} from './get-compositions';
export {
	ImageFormat,
	StillImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
	validImageFormats,
} from './image-format';
export type {LogLevel} from './log-level';
export {CancelSignal, makeCancelSignal} from './make-cancel-signal';
export {openBrowser} from './open-browser';
export type {ChromiumOptions} from './open-browser';
export {PixelFormat} from './pixel-format';
export {ProResProfile} from './prores-profile';
export {renderFrames} from './render-frames';
export {
	OnSlowestFrames,
	renderMedia,
	RenderMediaOnProgress,
	RenderMediaOptions,
	SlowFrame,
	StitchingState,
} from './render-media';
export {renderStill, RenderStillOptions} from './render-still';
export {StitcherOptions, stitchFramesToVideo} from './stitch-frames-to-video';
export {SymbolicatedStackFrame} from './symbolicate-stacktrace';
export {OnStartData, RenderFramesOutput} from './types';
export {OpenGlRenderer} from './validate-opengl-renderer';
export {validateOutputFilename} from './validate-output-filename';
export const RenderInternals = {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	validateFfmpeg,
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
	validImageFormats,
	validCodecs,
	DEFAULT_PIXEL_FORMAT,
	validateQuality,
	validateFrame,
	DEFAULT_TIMEOUT,
	DEFAULT_CODEC,
	isAudioCodec,
	logLevels,
	isEqualOrBelowLogLevel,
	isValidLogLevel,
	perf,
	makeDownloadMap,
	cleanDownloadMap,
	convertToPositiveFrameIndex,
	findRemotionRoot,
	getExecutableBinary,
	validateBitrate,
	getFfmpegVersion,
	canExtractFramesFast,
};

// Warn of potential performance issues with Apple Silicon (M1 chip under Rosetta)
checkNodeVersionAndWarnAboutRosetta();
