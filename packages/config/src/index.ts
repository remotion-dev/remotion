import {Config as RemotionConfig, Internals} from 'remotion';
import {Config} from './config';
import {getBrowser} from './config/browser';
import {getBrowserExecutable} from './config/browser-executable';
import {
	getChromiumDisableWebSecurity,
	getChromiumHeadlessMode,
	getChromiumOpenGlRenderer,
	getIgnoreCertificateErrors,
} from './config/chromium-flags';
import {getOutputCodecOrUndefined} from './config/codec';
import {getConcurrency} from './config/concurrency';
import {getActualCrf} from './config/crf';
import {getDotEnvLocation} from './config/env-file';
import {getAndValidateEveryNthFrame} from './config/every-nth-frame';
import {
	getCustomFfmpegExecutable,
	getCustomFfprobeExecutable,
} from './config/ffmpeg-executable';
import {getRange, setFrameRangeFromCli} from './config/frame-range';
import {getUserPreferredImageFormat} from './config/image-format';
import {getShouldOutputImageSequence} from './config/image-sequence';
import * as Logging from './config/log';
import {getMaxTimelineTracks} from './config/max-timeline-tracks';
import {getAndValidateNumberOfGifLoops} from './config/number-of-gif-loops';
import {getOutputLocation} from './config/output-location';
import {
	defaultOverrideFunction,
	getWebpackOverrideFn,
} from './config/override-webpack';
import {getShouldOverwrite} from './config/overwrite';
import {getPixelFormat} from './config/pixel-format';
import {getServerPort} from './config/preview-server';
import {getProResProfile} from './config/prores-profile';
import {getQuality} from './config/quality';
import {getScale} from './config/scale';
import {getStillFrame, setStillFrame} from './config/still-frame';
import {getCurrentPuppeteerTimeout} from './config/timeout';
import {getWebpackCaching} from './config/webpack-caching';

export {Config};

export const ConfigInternals = {
	getRange,
	getOutputCodecOrUndefined,
	getCustomFfmpegExecutable,
	getBrowser,
	getActualCrf,
	getPixelFormat,
	getProResProfile,
	getShouldOverwrite,
	getBrowserExecutable,
	getCustomFfprobeExecutable,
	getScale,
	getServerPort,
	getChromiumDisableWebSecurity,
	getIgnoreCertificateErrors,
	getChromiumHeadlessMode,
	getChromiumOpenGlRenderer,
	getAndValidateEveryNthFrame,
	getAndValidateNumberOfGifLoops,
	getConcurrency,
	getCurrentPuppeteerTimeout,
	getQuality,
	getStillFrame,
	getShouldOutputImageSequence,
	getDotEnvLocation,
	getUserPreferredImageFormat,
	getWebpackOverrideFn,
	getWebpackCaching,
	getOutputLocation,
	Logging,
	setFrameRangeFromCli,
	setStillFrame,
	getMaxTimelineTracks,
	defaultOverrideFunction,
};

export const overrideRemotion = () => {
	Object.assign(RemotionConfig, Config);
	Internals.enableLegacyRemotionConfig();
};
