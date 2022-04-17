import {addSilentAudioIfNecessary} from './add-silent-audio-if-necessary';
import {
	ffmpegHasFeature,
	getFfmpegBuildInfo,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {getActualConcurrency} from './get-concurrency';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {makeAssetsDownloadTmpDir} from './make-assets-download-dir';
import {normalizeServeUrl} from './normalize-serve-url';
import {serveStatic} from './serve-static';
import {spawnFfmpeg} from './stitcher';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {binaryExists, validateFfmpeg} from './validate-ffmpeg';
import {tmpDir} from './tmp-dir';
import {deleteDirectory} from './delete-directory';
import {prepareServer} from './prepare-server';
import {isServeUrl} from './is-serve-url';
import {ensureOutputDirectory} from './ensure-output-directory';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {getRealFrameRange} from './get-frame-to-render';
import {downloadFile} from './assets/download-file';
import {validateScale} from './validate-scale';
import {killAllBrowsers} from './open-browser';
import {parseStack} from './parse-browser-error-stack';
import {symbolicateStackTrace} from './symbolicate-stacktrace';
export {ErrorWithStackFrame} from './handle-javascript-exception';
export {SymbolicatedStackFrame} from './symbolicate-stacktrace';
export {
	renderMedia,
	RenderMediaOnProgress,
	StitchingState,
	RenderMediaOptions,
} from './render-media';
export type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
export {combineVideos} from './combine-videos';
export {FfmpegVersion} from './ffmpeg-flags';
export {getCompositions} from './get-compositions';
export {renderFrames} from './render';
export {renderStill} from './render-still';
export {stitchFramesToVideo, StitcherOptions} from './stitcher';
export {OnStartData, RenderFramesOutput} from './types';
export {BrowserLog} from './browser-log';
export type {ChromiumOptions} from './open-browser';
export {openBrowser} from './open-browser';

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
	symbolicateStackTrace,
};
