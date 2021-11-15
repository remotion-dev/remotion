import {TAsset, TCompMetadata} from 'remotion';
import {addSilentAudioIfNecessary} from './add-silent-audio-if-necessary';
import {
	ffmpegHasFeature,
	getFfmpegBuildInfo,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {getActualConcurrency} from './get-concurrency';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {max, min} from './min-max';
import {normalizeServeUrl} from './normalize-serve-url';
import {openBrowser} from './open-browser';
import {renderVideo} from './render-video';
import {serveStatic} from './serve-static';
import {spawnFfmpeg} from './stitcher';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {binaryExists, validateFfmpeg} from './validate-ffmpeg';

declare global {
	interface Window {
		ready: boolean;
		getStaticCompositions: () => TCompMetadata[];
		remotion_setFrame: (frame: number) => void;
		remotion_collectAssets: () => TAsset[];
	}
}

export {renderVideo, RenderVideoOnProgress} from './render-video';
export {combineVideos} from './combine-videos';
export {FfmpegVersion} from './ffmpeg-flags';
export {getCompositions} from './get-compositions';
export {renderFrames} from './render';
export {renderStill} from './render-still';
export {stitchFramesToVideo, StitcherOptions} from './stitcher';
export {OnStartData, RenderFramesOutput} from './types';
export {BrowserLog} from './browser-log';

export const RenderInternals = {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getFfmpegVersion,
	openBrowser,
	validateFfmpeg,
	binaryExists,
	getFfmpegBuildInfo,
	serveStatic,
	addSilentAudioIfNecessary,
	validateEvenDimensionsWithCodec,
	min,
	max,
	normalizeServeUrl,
	spawnFfmpeg,
};
