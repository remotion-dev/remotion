import {addSilentAudioIfNecessary} from './add-silent-audio-if-necessary';
import {downloadFile} from './assets/download-file';
import {deleteDirectory} from './delete-directory';
import {ensureOutputDirectory} from './ensure-output-directory';
import {symbolicateError} from './error-handling/symbolicate-error';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {
	ffmpegHasFeature,
	getFfmpegBuildInfo,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {getActualConcurrency} from './get-concurrency';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getRealFrameRange} from './get-frame-to-render';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {isServeUrl} from './is-serve-url';
import {makeAssetsDownloadTmpDir} from './make-assets-download-dir';
import {normalizeServeUrl} from './normalize-serve-url';
import {killAllBrowsers} from './open-browser';
import {parseStack} from './parse-browser-error-stack';
import {prepareServer} from './prepare-server';
import {serveStatic} from './serve-static';
import {spawnFfmpeg} from './stitcher';
import {tmpDir} from './tmp-dir';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {binaryExists, validateFfmpeg} from './validate-ffmpeg';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {validateScale} from './validate-scale';
export type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
export {BrowserLog} from './browser-log';
export {combineVideos} from './combine-videos';
export {ErrorWithStackFrame} from './error-handling/handle-javascript-exception';
export {FfmpegVersion} from './ffmpeg-flags';
export {getCompositions} from './get-compositions';
export {openBrowser} from './open-browser';
export type {ChromiumOptions} from './open-browser';
export {renderFrames} from './render';
export {
	renderMedia,
	RenderMediaOnProgress,
	RenderMediaOptions,
	StitchingState,
} from './render-media';
export {renderStill} from './render-still';
export {StitcherOptions, stitchFramesToVideo} from './stitcher';
export {SymbolicatedStackFrame} from './symbolicate-stacktrace';
export {OnStartData, RenderFramesOutput} from './types';

export const RenderInternals = {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getFfmpegVersion,
	validateFfmpeg,
	binaryExists,
	getFfmpegBuildInfo,
	serveStatic,
	addSilentAudioIfNecessary,
	validateEvenDimensionsWithCodec,
	normalizeServeUrl,
	spawnFfmpeg,
	getFileExtensionFromCodec,
	makeAssetsDownloadTmpDir,
	tmpDir,
	deleteDirectory,
	prepareServer,
	isServeUrl,
	ensureOutputDirectory,
	getRealFrameRange,
	validatePuppeteerTimeout,
	downloadFile,
	validateScale,
	killAllBrowsers,
	parseStack,
	symbolicateError,
	SymbolicateableError,
};
