import {ffmpegHasFeature, getFfmpegVersion} from './ffmpeg-flags';
import {getActualConcurrency} from './get-concurrency';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {openBrowser} from './open-browser';
import {binaryExists, validateFfmpeg} from './validate-ffmpeg';

export {FfmpegVersion} from './ffmpeg-flags';
export {getCompositions} from './get-compositions';
export {OnStartData, renderFrames, RenderFramesOutput} from './render';
export {stitchFramesToVideo} from './stitcher';
export const RenderInternals = {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getFfmpegVersion,
	openBrowser,
	validateFfmpeg,
	binaryExists,
};
