import type {
	AudioCodec,
	BrowserExecutable,
	Codec,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';
import {Config, ConfigInternals} from './config';
import {Log} from './log';

const {
	beepOnFinishOption,
	colorSpaceOption,
	offthreadVideoCacheSizeInBytes,
	encodingBufferSizeOption,
	encodingMaxRateOption,
	deleteAfterOption,
	folderExpiryOption,
	enableMultiprocessOnLinuxOption,
} = BrowserSafeApis.options;

type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: VideoImageFormat | StillImageFormat;
	['prores-profile']: ProResProfile;
	['x264-preset']: X264Preset;
	['bundle-cache']: string;
	['env-file']: string;
	['ignore-certificate-errors']: string;
	['disable-web-security']: string;
	['every-nth-frame']: number;
	['number-of-gif-loops']: number;
	['number-of-shared-audio-tags']: number;
	[offthreadVideoCacheSizeInBytes.cliFlag]: typeof offthreadVideoCacheSizeInBytes.type;
	[colorSpaceOption.cliFlag]: typeof colorSpaceOption.type;
	[beepOnFinishOption.cliFlag]: typeof beepOnFinishOption.type;
	version: string;
	codec: Codec;
	concurrency: number;
	timeout: number;
	config: string;
	['public-dir']: string;
	['audio-bitrate']: string;
	['video-bitrate']: string;
	[encodingBufferSizeOption.cliFlag]: typeof encodingBufferSizeOption.type;
	[encodingMaxRateOption.cliFlag]: typeof encodingMaxRateOption.type;
	['audio-codec']: AudioCodec;
	crf: number;
	force: boolean;
	output: string;
	overwrite: boolean;
	png: boolean;
	props: string;
	quality: number;
	['jpeg-quality']: number;
	frames: string | number;
	scale: number;
	sequence: boolean;
	quiet: boolean;
	q: boolean;
	log: string;
	help: boolean;
	port: number;
	frame: string | number;
	['disable-headless']: boolean;
	['disable-keyboard-shortcuts']: boolean;
	muted: boolean;
	height: number;
	width: number;
	runs: number;
	concurrencies: string;
	['enforce-audio-track']: boolean;
	gl: OpenGlRenderer;
	['package-manager']: string;
	['webpack-poll']: number;
	['no-open']: boolean;
	['browser']: string;
	['browser-args']: string;
	['user-agent']: string;
	[deleteAfterOption.cliFlag]: string | undefined;
	[folderExpiryOption.cliFlag]: boolean | undefined;
	[enableMultiprocessOnLinuxOption.cliFlag]: boolean;
};

export const BooleanFlags = [
	'force',
	'overwrite',
	'sequence',
	'help',
	'quiet',
	'q',
	'muted',
	'enforce-audio-track',
	// Lambda flags
	'force',
	'disable-chunk-optimization',
	'save-browser-logs',
	'disable-cloudwatch',
	'enable-lambda-insights',
	'yes',
	'y',
	'disable-web-security',
	'ignore-certificate-errors',
	'disable-headless',
	'disable-keyboard-shortcuts',
	'default-only',
	'no-open',
	beepOnFinishOption.cliFlag,
];

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: BooleanFlags,
}) as CommandLineOptions & {
	_: string[];
};

export const parseCommandLine = () => {
	if (parsedCli['pixel-format']) {
		Config.setPixelFormat(parsedCli['pixel-format']);
	}

	if (parsedCli['browser-executable']) {
		Config.setBrowserExecutable(parsedCli['browser-executable']);
	}

	if (parsedCli['number-of-gif-loops']) {
		Config.setNumberOfGifLoops(parsedCli['number-of-gif-loops']);
	}

	if (typeof parsedCli['bundle-cache'] !== 'undefined') {
		Config.setCachingEnabled(parsedCli['bundle-cache'] !== 'false');
	}

	if (parsedCli['disable-web-security']) {
		Config.setChromiumDisableWebSecurity(true);
	}

	if (parsedCli['ignore-certificate-errors']) {
		Config.setChromiumIgnoreCertificateErrors(true);
	}

	if (parsedCli['disable-headless']) {
		Config.setChromiumHeadlessMode(false);
	}

	if (parsedCli['user-agent']) {
		Config.setChromiumUserAgent(parsedCli['user-agent']);
	}

	if (parsedCli.log) {
		if (!RenderInternals.isValidLogLevel(parsedCli.log)) {
			Log.error('Invalid `--log` value passed.');
			Log.error(
				`Accepted values: ${RenderInternals.logLevels
					.map((l) => `'${l}'`)
					.join(', ')}.`,
			);
			process.exit(1);
		}

		ConfigInternals.Logging.setLogLevel(parsedCli.log as LogLevel);
	}

	if (parsedCli.concurrency) {
		Config.setConcurrency(parsedCli.concurrency);
	}

	if (parsedCli.timeout) {
		Config.setTimeoutInMilliseconds(parsedCli.timeout);
	}

	if (parsedCli.height) {
		Config.overrideHeight(parsedCli.height);
	}

	if (parsedCli.width) {
		Config.overrideWidth(parsedCli.width);
	}

	if (parsedCli.frames) {
		ConfigInternals.setFrameRangeFromCli(parsedCli.frames);
	}

	if (parsedCli.frame) {
		ConfigInternals.setStillFrame(Number(parsedCli.frame));
	}

	if (parsedCli.png) {
		throw new Error(
			'The --png flag has been removed. Use --sequence --image-format=png from now on.',
		);
	}

	if (parsedCli.sequence) {
		Config.setImageSequence(true);
	}

	if (typeof parsedCli.crf !== 'undefined') {
		Config.setCrf(parsedCli.crf);
	}

	if (parsedCli['every-nth-frame']) {
		Config.setEveryNthFrame(parsedCli['every-nth-frame']);
	}

	if (parsedCli.gl) {
		Config.setChromiumOpenGlRenderer(parsedCli.gl);
	}

	if (parsedCli['prores-profile']) {
		Config.setProResProfile(
			String(parsedCli['prores-profile']) as ProResProfile,
		);
	}

	if (parsedCli['x264-preset']) {
		Config.setX264Preset(String(parsedCli['x264-preset']) as X264Preset);
	}

	if (parsedCli.overwrite) {
		Config.setOverwriteOutput(parsedCli.overwrite);
	}

	if (typeof parsedCli.quality !== 'undefined') {
		Log.warn(
			{indent: false, logLevel: 'info'},
			'The --quality flag has been renamed to --jpeg-quality instead.',
		);
		Config.setJpegQuality(parsedCli.quality);
	}

	if (typeof parsedCli['jpeg-quality'] !== 'undefined') {
		Config.setJpegQuality(parsedCli['jpeg-quality']);
	}

	if (typeof parsedCli.scale !== 'undefined') {
		Config.setScale(parsedCli.scale);
	}

	if (typeof parsedCli.muted !== 'undefined') {
		Config.setMuted(parsedCli.muted);
	}

	if (typeof parsedCli['disable-keyboard-shortcuts'] !== 'undefined') {
		Config.setKeyboardShortcutsEnabled(
			!parsedCli['disable-keyboard-shortcuts'],
		);
	}

	if (typeof parsedCli['enforce-audio-track'] !== 'undefined') {
		Config.setEnforceAudioTrack(parsedCli['enforce-audio-track']);
	}

	if (typeof parsedCli['public-dir'] !== 'undefined') {
		Config.setPublicDir(parsedCli['public-dir']);
	}

	if (typeof parsedCli['webpack-poll'] !== 'undefined') {
		Config.setWebpackPollingInMilliseconds(parsedCli['webpack-poll']);
	}

	if (typeof parsedCli['audio-bitrate'] !== 'undefined') {
		Config.setAudioBitrate(parsedCli['audio-bitrate']);
	}

	if (typeof parsedCli['video-bitrate'] !== 'undefined') {
		Config.setVideoBitrate(parsedCli['video-bitrate']);
	}

	if (typeof parsedCli['buffer-size'] !== 'undefined') {
		Config.setEncodingBufferSize(parsedCli['buffer-size']);
	}

	if (typeof parsedCli['max-rate'] !== 'undefined') {
		Config.setEncodingMaxRate(parsedCli['max-rate']);
	}

	if (typeof parsedCli['beep-on-finish'] !== 'undefined') {
		Config.setBeepOnFinish(parsedCli['beep-on-finish']);
	}

	if (typeof parsedCli['offthreadvideo-cache-size-in-bytes'] !== 'undefined') {
		Config.setOffthreadVideoCacheSizeInBytes(
			parsedCli['offthreadvideo-cache-size-in-bytes'],
		);
	}

	if (typeof parsedCli['delete-after'] !== 'undefined') {
		Config.setDeleteAfter(
			parsedCli['delete-after'] as '1-day' | '3-days' | '7-days' | '30-days',
		);
	}

	if (typeof parsedCli['color-space'] !== 'undefined') {
		Config.setColorSpace(parsedCli['color-space']);
	}

	if (typeof parsedCli['enable-folder-expiry'] !== 'undefined') {
		Config.setEnableFolderExpiry(parsedCli['enable-folder-expiry']);
	}

	if (
		typeof parsedCli[
			BrowserSafeApis.options.enableMultiprocessOnLinuxOption.cliFlag
		] !== 'undefined'
	) {
		Config.setEnableFolderExpiry(
			parsedCli[
				BrowserSafeApis.options.enableMultiprocessOnLinuxOption.cliFlag
			],
		);
	}
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;
