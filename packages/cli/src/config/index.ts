import {Config as RemotionConfig, Internals} from 'remotion';
import {getBrowser} from './browser';
import {getBrowserExecutable} from './browser-executable';
import {
	getChromiumDisableWebSecurity,
	getChromiumHeadlessMode,
	getChromiumOpenGlRenderer,
	getIgnoreCertificateErrors,
} from './chromium-flags';
import {getOutputCodecOrUndefined} from './codec';
import {getConcurrency} from './concurrency';
import {getDotEnvLocation} from './env-file';
import {getRange, setFrameRangeFromCli} from './frame-range';
import {getUserPreferredImageFormat} from './image-format';
import {getShouldOutputImageSequence} from './image-sequence';
import * as Logging from './log';
import {getMaxTimelineTracks} from './max-timeline-tracks';
import {getOutputLocation} from './output-location';
import {
	defaultOverrideFunction,
	getWebpackOverrideFn,
} from './override-webpack';
import {getShouldOverwrite} from './overwrite';
import {getPixelFormat} from './pixel-format';
import {getServerPort} from './preview-server';
import {getProResProfile} from './prores-profile';
import {getQuality} from './quality';
import {getScale} from './scale';
import {getStillFrame, setStillFrame} from './still-frame';
import {getCurrentPuppeteerTimeout} from './timeout';
import {getWebpackCaching} from './webpack-caching';

import type {WebpackConfiguration} from '@remotion/bundler';
import type {ConfigType} from 'remotion';
import {getAudioCodec, setAudioCodec} from './audio-codec';
import {
	getAudioBitrate,
	getVideoBitrate,
	setAudioBitrate,
	setVideoBitrate,
} from './bitrate';
import {setBrowserExecutable} from './browser-executable';
import {
	setChromiumDisableWebSecurity,
	setChromiumHeadlessMode,
	setChromiumIgnoreCertificateErrors,
	setChromiumOpenGlRenderer,
} from './chromium-flags';
import {setCodec, setOutputFormat} from './codec';
import type {Concurrency} from './concurrency';
import {setConcurrency} from './concurrency';
import {getCrfOrUndefined, setCrf} from './crf';
import {
	getEnforceAudioTrack,
	setEnforceAudioTrack,
} from './enforce-audio-track';
import {getEntryPoint, setEntryPoint} from './entry-point';
import {setDotEnvLocation} from './env-file';
import {getEveryNthFrame, setEveryNthFrame} from './every-nth-frame';
import {
	getFfmpegOverrideFunction,
	setFfmpegOverrideFunction,
} from './ffmpeg-override';
import {setFrameRange} from './frame-range';
import {getHeight, overrideHeight} from './height';
import {setImageFormat} from './image-format';
import {setImageSequence} from './image-sequence';
import {
	getKeyboardShortcutsEnabled,
	setKeyboardShortcutsEnabled,
} from './keyboard-shortcuts';
import {setLogLevel} from './log';
import {setMaxTimelineTracks} from './max-timeline-tracks';
import {getMuted, setMuted} from './muted';
import {getNumberOfGifLoops, setNumberOfGifLoops} from './number-of-gif-loops';
import {setNumberOfSharedAudioTags} from './number-of-shared-audio-tags';
import {getShouldOpenBrowser, setShouldOpenBrowser} from './open-browser';
import {setOutputLocation} from './output-location';
import type {WebpackOverrideFn} from './override-webpack';
import {overrideWebpackConfig} from './override-webpack';
import {setOverwriteOutput} from './overwrite';
import {setPixelFormat} from './pixel-format';
import {setPort} from './preview-server';
import {setProResProfile} from './prores-profile';
import {getPublicDir, setPublicDir} from './public-dir';
import {setQuality} from './quality';
import {setScale} from './scale';
import {setPuppeteerTimeout} from './timeout';
import {setWebpackCaching} from './webpack-caching';
import {
	getWebpackPolling,
	setWebpackPollingInMilliseconds,
} from './webpack-poll';
import {getWidth, overrideWidth} from './width';

const Preview = {
	setMaxTimelineTracks,
	setKeyboardShortcutsEnabled,
	setNumberOfSharedAudioTags,
	setWebpackPollingInMilliseconds,
	setShouldOpenBrowser,
};

const Bundling = {
	overrideWebpackConfig,
	setCachingEnabled: setWebpackCaching,
	setPort,
	setPublicDir,
	setEntryPoint,
};

const Log = {
	setLevel: setLogLevel,
};

const Puppeteer = {
	setBrowserExecutable,
	setTimeoutInMilliseconds: setPuppeteerTimeout,
	setDelayRenderTimeoutInMilliseconds: setPuppeteerTimeout,
	setChromiumDisableWebSecurity,
	setChromiumIgnoreCertificateErrors,
	setChromiumHeadlessMode,
	setChromiumOpenGlRenderer,
};

const Rendering = {
	setDotEnvLocation,
	setConcurrency,
	setQuality,
	setImageFormat,
	setFrameRange,
	setScale,
	setEveryNthFrame,
	setNumberOfGifLoops,
	setMuted,
	setEnforceAudioTrack,
};

const Output = {
	setOutputLocation,
	setOverwriteOutput,
	setPixelFormat,
	setOutputFormat,
	setCodec,
	setCrf,
	setImageSequence,
	setProResProfile,
	setAudioBitrate,
	setVideoBitrate,
	overrideHeight,
	overrideWidth,
	overrideFfmpegCommand: setFfmpegOverrideFunction,
};

export const Config: ConfigType = {
	// New flat config format
	...Preview,
	...Bundling,
	...Log,
	...Puppeteer,
	...Rendering,
	...Output,
	// Legacy config format
	Preview,
	Bundling,
	Log,
	Puppeteer,
	Rendering,
	Output,
	// Options added after migration
	setAudioCodec,
} as ConfigType;

export type {Concurrency, WebpackConfiguration, WebpackOverrideFn};

export const ConfigInternals = {
	getRange,
	getOutputCodecOrUndefined,
	getBrowser,
	getPixelFormat,
	getProResProfile,
	getShouldOverwrite,
	getBrowserExecutable,
	getScale,
	getServerPort,
	getChromiumDisableWebSecurity,
	getIgnoreCertificateErrors,
	getChromiumHeadlessMode,
	getChromiumOpenGlRenderer,
	getEveryNthFrame,
	getConcurrency,
	getCurrentPuppeteerTimeout,
	getQuality,
	getAudioCodec,
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
	setMuted,
	getMuted,
	getEnforceAudioTrack,
	setEnforceAudioTrack,
	getKeyboardShortcutsEnabled,
	getPublicDir,
	getFfmpegOverrideFunction,
	getAudioBitrate,
	getVideoBitrate,
	getHeight,
	getWidth,
	getCrfOrUndefined,
	getEntryPoint,
	getNumberOfGifLoops,
	getWebpackPolling,
	getShouldOpenBrowser,
};

export const overrideRemotion = () => {
	Object.assign(RemotionConfig, Config);
	Internals.enableLegacyRemotionConfig();
};
