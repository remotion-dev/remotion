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
import {
	getUserPreferredStillImageFormat,
	getUserPreferredVideoImageFormat,
	setStillImageFormat,
	setVideoImageFormat,
} from './image-format';
import {getShouldOutputImageSequence} from './image-sequence';
import {getJpegQuality} from './jpeg-quality';
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
import {getScale} from './scale';
import {getStillFrame, setStillFrame} from './still-frame';
import {getCurrentPuppeteerTimeout} from './timeout';
import {getWebpackCaching} from './webpack-caching';

import type {WebpackConfiguration} from '@remotion/bundler';
import type {
	BrowserExecutable,
	CodecOrUndefined,
	Crf,
	FrameRange,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
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
import {setCodec} from './codec';
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
import {setImageSequence} from './image-sequence';
import {setJpegQuality} from './jpeg-quality';
import {
	getKeyboardShortcutsEnabled,
	setKeyboardShortcutsEnabled,
} from './keyboard-shortcuts';
import {setLogLevel} from './log';
import {setMaxTimelineTracks} from './max-timeline-tracks';
import {getMuted, setMuted} from './muted';
import type {Loop} from './number-of-gif-loops';
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
import {setScale} from './scale';
import {setPuppeteerTimeout} from './timeout';
import {getChromiumUserAgent, setChromiumUserAgent} from './user-agent';
import {setWebpackCaching} from './webpack-caching';
import {
	getWebpackPolling,
	setWebpackPollingInMilliseconds,
} from './webpack-poll';
import {getWidth, overrideWidth} from './width';

declare global {
	interface RemotionBundlingOptions {
		/**
		 * Specify the entry point so you don't have to specify it in the
		 * CLI command
		 */
		readonly setEntryPoint: (src: string) => void;

		/**
		 * Whether Webpack bundles should be cached to make
		 * subsequent renders faster. Default: true
		 */
		readonly setCachingEnabled: (flag: boolean) => void;
		/**
		 * Define on which port Remotion should start it's HTTP servers.
		 * By default, Remotion will try to find a free port.
		 * If you specify a port, but it's not available, Remotion will throw an error.
		 */
		readonly setPort: (port: number | undefined) => void;
		/**
		 * Define the location of the public/ directory.
		 * By default it is a folder named "public" inside the current working directory.
		 * You can set an absolute path or a relative path that will be resolved from the closest package.json location.
		 */
		readonly setPublicDir: (publicDir: string | null) => void;
		readonly overrideWebpackConfig: (f: WebpackOverrideFn) => void;
	}
	// Legacy config format: New options to not need to be added here.
	interface RemotionConfigObject {
		/**
		 * Change the maximum amount of tracks that are shown in the timeline.
		 * @param maxTracks The maximum amount of timeline tracks that you would like to show.
		 * @default 15
		 */
		readonly setMaxTimelineTracks: (maxTracks: number) => void;
		/**
		 * Enable Keyboard shortcuts in the Remotion Studio.
		 * @param enabled Boolean whether to enable the keyboard shortcuts
		 * @default true
		 */
		readonly setKeyboardShortcutsEnabled: (enableShortcuts: boolean) => void;
		/**
		 * Set number of shared audio tags. https://www.remotion.dev/docs/player/autoplay#use-the-numberofsharedaudiotags-property
		 * @param numberOfAudioTags
		 * @default 0
		 */
		readonly setNumberOfSharedAudioTags: (numberOfAudioTags: number) => void;
		/**
		 * Enable Webpack polling instead of file system listeners for hot reloading in the Studio.
		 * This is useful if you are using a remote directory or a virtual machine.
		 * @param interval
		 * @default null
		 */
		readonly setWebpackPollingInMilliseconds: (interval: number | null) => void;
		/**
		 * Whether Remotion should open a browser when starting the Studio.
		 * @param should
		 * @default true
		 */
		readonly setShouldOpenBrowser: (should: boolean) => void;
		/**
		 * Set the log level.
		 * Acceptable values: 'error' | 'warning' | 'info' | 'verbose'
		 * Default value: 'info'
		 *
		 * Set this to 'verbose' to get browser logs and other IO.
		 */
		readonly setLevel: (
			newLogLevel: 'verbose' | 'info' | 'warn' | 'error'
		) => void;
		/**
		 * Specify executable path for the browser to use.
		 * Default: null, which will make Remotion find or download a version of said browser.
		 */
		readonly setBrowserExecutable: (
			newBrowserExecutablePath: BrowserExecutable
		) => void;
		/**
		 * Set how many milliseconds a frame may take to render before it times out.
		 * Default: `30000`
		 */
		readonly setDelayRenderTimeoutInMilliseconds: (
			newPuppeteerTimeout: number
		) => void;
		/**
		 * @deprecated Renamed to `setDelayRenderTimeoutInMilliseconds`.
		 * Set how many milliseconds a frame may take to render before it times out.
		 * Default: `30000`
		 */
		readonly setTimeoutInMilliseconds: (newPuppeteerTimeout: number) => void;
		/**
		 * Setting deciding whether to disable CORS and other Chrome security features.
		 * Default: false
		 */
		readonly setChromiumDisableWebSecurity: (should: boolean) => void;
		/**
		 * Setting whether to ignore any invalid SSL certificates, such as self-signed ones.
		 * Default: false
		 */
		readonly setChromiumIgnoreCertificateErrors: (should: boolean) => void;
		/**
		 * If false, will open an actual browser during rendering to observe progress.
		 * Default: true
		 */
		readonly setChromiumHeadlessMode: (should: boolean) => void;
		/**
		 * Set the OpenGL rendering backend for Chrome. Possible values: 'egl', 'angle', 'swiftshader' and 'swangle'.
		 * Default: 'swangle' in Lambda, null elsewhere.
		 */
		readonly setChromiumOpenGlRenderer: (
			renderer: 'swangle' | 'angle' | 'egl' | 'swiftshader'
		) => void;
		/**
		 * Set the user agent for Chrome. Only works during rendering.
		 * Default is the default user agent for Chrome
		 */
		readonly setChromiumUserAgent: (userAgent: string | null) => void;
		/**
		 * Set a custom location for a .env file.
		 * Default: `.env`
		 */
		readonly setDotEnvLocation: (file: string) => void;
		/**
		 * Sets how many Puppeteer instances will work on rendering your video in parallel.
		 * Default: `null`, meaning half of the threads available on your CPU.
		 */
		readonly setConcurrency: (newConcurrency: Concurrency) => void;
		/**
		 * @deprecated Renamed to `setJpegQuality`.
		 */
		readonly setQuality: (q: never) => void;
		/**
		 * @deprecated Separated into `setStillImageFormat()` and `setVideoImageFormat()`.
		 */
		readonly setImageFormat: (q: never) => void;
		/**
		 * Set the JPEG quality for the frames.
		 * Must be between 0 and 100.
		 * Default: 80
		 */
		readonly setJpegQuality: (q: number | undefined) => void;
		/** Decide the image format for still renders.
		 */
		readonly setStillImageFormat: (format: StillImageFormat) => void;
		/** Decide in which image format to render. Can be either 'jpeg' or 'png'.
		 * PNG is slower, but supports transparency.
		 */
		readonly setVideoImageFormat: (format: VideoImageFormat) => void;
		/**
		 * Render only a subset of a video.
		 * Pass in a tuple [20, 30] to only render frames 20-30 into a video.
		 * Pass in a single number `20` to only render a single frame as an image.
		 * The frame count starts at 0.
		 */
		readonly setFrameRange: (newFrameRange: FrameRange | null) => void;
		/**
		 * Scales the output dimensions by a factor.
		 * Default: 1.
		 */
		readonly setScale: (newScale: number) => void;
		/**
		 * Specify which frames should be picked for rendering a GIF
		 * Default: 1, which means every frame
		 * https://remotion.dev/docs/render-as-gif
		 */
		readonly setEveryNthFrame: (frame: number) => void;
		/**
		 * Specify the number of Loop a GIF should have.
		 * Default: null (means GIF will loop infinite)
		 */
		readonly setNumberOfGifLoops: (newLoop: Loop) => void;
		/**
		 * Disable audio output.
		 * Default: false
		 */
		readonly setMuted: (muted: boolean) => void;
		/**
		 * Don't render an audio track if it would be silent.
		 * Default: true
		 */
		readonly setEnforceAudioTrack: (enforceAudioTrack: boolean) => void;

		/**
		 * Set the output file location string. Default: `out/{composition}.{codec}`
		 */
		readonly setOutputLocation: (newOutputLocation: string) => void;
		/**
		 * If the video file already exists, should Remotion overwrite
		 * the output? Default: true
		 */
		readonly setOverwriteOutput: (newOverwrite: boolean) => void;
		/**
		 * Sets the pixel format in FFMPEG.
		 * See https://trac.ffmpeg.org/wiki/Chroma%20Subsampling for an explanation.
		 * You can override this using the `--pixel-format` Cli flag.
		 */
		readonly setPixelFormat: (
			format:
				| 'yuv420p'
				| 'yuva420p'
				| 'yuv422p'
				| 'yuv444p'
				| 'yuv420p10le'
				| 'yuv422p10le'
				| 'yuv444p10le'
				| 'yuva444p10le'
		) => void;
		/**
		 * Specify the codec for stitching the frames into a video.
		 * Can be `h264` (default), `h265`, `vp8` or `vp9`
		 */
		readonly setCodec: (newCodec: CodecOrUndefined) => void;
		/**
		 * Set the Constant Rate Factor to pass to FFMPEG.
		 * Lower values mean better quality, but be aware that the ranges of
		 * possible values greatly differs between codecs.
		 */
		readonly setCrf: (newCrf: Crf) => void;
		/**
		 * Set to true if don't want a video but an image sequence as the output.
		 */
		readonly setImageSequence: (newImageSequence: boolean) => void;
		/**
		 * Overrides the height of a composition
		 */
		readonly overrideHeight: (newHeight: number) => void;
		/**
		 * Overrides the width of a composition
		 */
		readonly overrideWidth: (newWidth: number) => void;
		/**
		 * Set the ProRes profile.
		 * This method is only valid if the codec has been set to 'prores'.
		 * Possible values: 4444-xq, 4444, hq, standard, light, proxy. Default: 'hq'
		 * See https://avpres.net/FFmpeg/im_ProRes.html for meaning of possible values.
		 */
		readonly setProResProfile: (
			profile:
				| '4444-xq'
				| '4444'
				| 'hq'
				| 'standard'
				| 'light'
				| 'proxy'
				| undefined
		) => void;
		/**
		 * Override the arguments that Remotion passes to FFMPEG.
		 * Consult https://remotion.dev/docs/renderer/render-media#ffmpegoverride before using this feature.
		 */
		readonly overrideFfmpegCommand: (
			command: (info: {
				type: 'pre-stitcher' | 'stitcher';
				args: string[];
			}) => string[]
		) => void;

		/**
		 * Set a target audio bitrate to be passed to FFMPEG.
		 */
		readonly setAudioBitrate: (bitrate: string | null) => void;

		/**
		 * Set a target video bitrate to be passed to FFMPEG.
		 * Mutually exclusive with setCrf().
		 */
		readonly setVideoBitrate: (bitrate: string | null) => void;
	}
}

type FlatConfig = RemotionConfigObject &
	RemotionBundlingOptions & {
		/**
		 * Set the audio codec to use for the output video.
		 * See the Encoding guide in the docs for defaults and available options.
		 */
		setAudioCodec: (codec: 'pcm-16' | 'aac' | 'mp3' | 'opus') => void;
	};

export const Config: FlatConfig = {
	setMaxTimelineTracks,
	setKeyboardShortcutsEnabled,
	setNumberOfSharedAudioTags,
	setWebpackPollingInMilliseconds,
	setShouldOpenBrowser,
	overrideWebpackConfig,
	setCachingEnabled: setWebpackCaching,
	setPort,
	setPublicDir,
	setEntryPoint,
	setLevel: setLogLevel,
	setBrowserExecutable,
	setTimeoutInMilliseconds: setPuppeteerTimeout,
	setDelayRenderTimeoutInMilliseconds: setPuppeteerTimeout,
	setChromiumDisableWebSecurity,
	setChromiumIgnoreCertificateErrors,
	setChromiumHeadlessMode,
	setChromiumOpenGlRenderer,
	setChromiumUserAgent,
	setDotEnvLocation,
	setConcurrency,
	setQuality: () => {
		throw new Error(
			'setQuality() has been renamed - use setJpegQuality() instead.'
		);
	},
	setImageFormat: () => {
		throw new Error(
			'setImageFormat() has been renamed - use setVideoImageFormat() or setStillImageFormat() instead.'
		);
	},
	setJpegQuality,
	setStillImageFormat,
	setVideoImageFormat,
	setFrameRange,
	setScale,
	setEveryNthFrame,
	setNumberOfGifLoops,
	setMuted,
	setEnforceAudioTrack,
	setOutputLocation,
	setOverwriteOutput,
	setPixelFormat,
	setCodec,
	setCrf,
	setImageSequence,
	setProResProfile,
	setAudioBitrate,
	setVideoBitrate,
	overrideHeight,
	overrideWidth,
	overrideFfmpegCommand: setFfmpegOverrideFunction,
	setAudioCodec,
};

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
	getJpegQuality,
	getAudioCodec,
	getStillFrame,
	getShouldOutputImageSequence,
	getDotEnvLocation,
	getUserPreferredStillImageFormat,
	getUserPreferredVideoImageFormat,
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
	getChromiumUserAgent,
};
