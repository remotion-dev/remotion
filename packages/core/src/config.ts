/**
 * The configuration has moved to @remotion/cli.
 * For the moment the type definitions are going to stay here
 */

type Concurrency = number | null;
import type {Configuration} from 'webpack';
type WebpackConfiguration = Configuration;
type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration
) => WebpackConfiguration;
type BrowserExecutable = string | null;
type FrameRange = number | [number, number];
type FfmpegExecutable = string | null;
type Loop = number | null;
type CodecOrUndefined =
	| 'h264'
	| 'h265'
	| 'vp8'
	| 'vp9'
	| 'mp3'
	| 'aac'
	| 'wav'
	| 'prores'
	| 'h264-mkv'
	| 'gif'
	| undefined;
type Crf = number | undefined;

export type ConfigType = {
	readonly Preview: {
		/**
		 * Change the maximum amount of tracks that are shown in the timeline.
		 * @param maxTracks The maximum amount of timeline tracks that you would like to show.
		 * @default 15
		 */
		readonly setMaxTimelineTracks: (maxTracks: number) => void;
		/**
		 * Enable Keyboard shortcuts in the Remotion Preview.
		 * @param enabled Boolean whether to enable the keyboard shortcuts
		 * @default true
		 */
		readonly setKeyboardShortcutsEnabled: (enableShortcuts: boolean) => void;
	};
	readonly Bundling: {
		/**
		 * Pass in a function which takes the current Webpack config
		 * and return a modified Webpack configuration.
		 * Docs: http://remotion.dev/docs/webpack
		 */
		readonly overrideWebpackConfig: (fn: WebpackOverrideFn) => void;
		/**
		 * Whether Webpack bundles should be cached to make
		 * subsequent renders faster. Default: true
		 */
		readonly setCachingEnabled: (flag: boolean) => void;
		/**
		 * Define on which port Remotion should start it's HTTP servers during preview and rendering.
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
	};
	readonly Log: {
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
	};
	readonly Puppeteer: {
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
	};
	readonly Rendering: {
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
		 * Set the JPEG quality for the frames.
		 * Must be between 0 and 100.
		 * Must be between 0 and 100.
		 * Default: 80
		 */
		readonly setQuality: (q: number | undefined) => void;
		/** Decide in which image format to render. Can be either 'jpeg' or 'png'.
		 * PNG is slower, but supports transparency.
		 */
		readonly setImageFormat: (format: 'png' | 'jpeg' | 'none') => void;
		/**
		 * Render only a subset of a video.
		 * Pass in a tuple [20, 30] to only render frames 20-30 into a video.
		 * Pass in a single number `20` to only render a single frame as an image.
		 * The frame count starts at 0.
		 */
		readonly setFrameRange: (newFrameRange: FrameRange | null) => void;
		/**
		 * Specify local ffmpeg executable.
		 * Default: null, which will use ffmpeg available in PATH.
		 */
		readonly setFfmpegExecutable: (ffmpegPath: FfmpegExecutable) => void;
		/**
		 * Specify local ffprobe executable.
		 * Default: null, which will use ffprobe available in PATH.
		 */
		readonly setFfprobeExecutable: (ffprobePath: FfmpegExecutable) => void;
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
	};
	readonly Output: {
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
		 * @deprecated Use setCodec() and setImageSequence() instead.
		 * Specify what kind of output you, either `mp4` or `png-sequence`.
		 */
		readonly setOutputFormat: (newLegacyFormat: 'mp4' | 'png-sequence') => void;
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
		 * Override the output video's height.
		 * Ovverrides natural height of the video.
		 * See h264 restriction
		 */
		readonly setHeight: (newHeight: number) => void;
		/**
		 * Set new width.
		 * Overrides natural width of the video.
		 */
		readonly setWidth: (newWidth: number) => void;
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
	};
};
export type {Concurrency, WebpackConfiguration, WebpackOverrideFn};

const conf = {} as unknown as ConfigType;

let enabled = false;

export const Config = new Proxy(conf, {
	get(target, prop, receiver) {
		if (!enabled) {
			throw new Error(
				'To use the Remotion config file, you need to have @remotion/cli installed.\n- Make sure that all versions of Remotion are the same.\n- Make sure that @remotion/cli is installed.\n- Make sure Config is imported from "@remotion/cli", not "remotion".'
			);
		}

		return Reflect.get(target, prop, receiver);
	},
});

export const enableLegacyRemotionConfig = () => {
	enabled = true;
};
