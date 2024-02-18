import type {
	AudioCodec,
	BrowserExecutable,
	Codec,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type {TypeOfOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';
import {Config, ConfigInternals} from './config';
import {Log} from './log';

const {
	beepOnFinishOption,
	colorSpaceOption,
	offthreadVideoCacheSizeInBytesOption,
	encodingBufferSizeOption,
	encodingMaxRateOption,
	deleteAfterOption,
	folderExpiryOption,
	enableMultiprocessOnLinuxOption,
	numberOfGifLoopsOption,
	x264Option,
	enforceAudioOption,
	jpegQualityOption,
	audioBitrateOption,
	videoBitrateOption,
} = BrowserSafeApis.options;

type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: VideoImageFormat | StillImageFormat;
	['prores-profile']: ProResProfile;
	[x264Option.cliFlag]: TypeOfOption<typeof x264Option>;
	['bundle-cache']: string;
	['env-file']: string;
	['ignore-certificate-errors']: string;
	['disable-web-security']: string;
	['every-nth-frame']: number;
	[numberOfGifLoopsOption.cliFlag]: TypeOfOption<typeof numberOfGifLoopsOption>;
	['number-of-shared-audio-tags']: number;
	[offthreadVideoCacheSizeInBytesOption.cliFlag]: TypeOfOption<
		typeof offthreadVideoCacheSizeInBytesOption
	>;
	[colorSpaceOption.cliFlag]: TypeOfOption<typeof colorSpaceOption>;
	[beepOnFinishOption.cliFlag]: TypeOfOption<typeof beepOnFinishOption>;
	version: string;
	codec: Codec;
	concurrency: number;
	timeout: number;
	config: string;
	['public-dir']: string;
	[audioBitrateOption.cliFlag]: TypeOfOption<typeof audioBitrateOption>;
	[videoBitrateOption.cliFlag]: TypeOfOption<typeof videoBitrateOption>;
	[encodingBufferSizeOption.cliFlag]: TypeOfOption<
		typeof encodingBufferSizeOption
	>;
	[encodingMaxRateOption.cliFlag]: TypeOfOption<typeof encodingMaxRateOption>;
	['audio-codec']: AudioCodec;
	crf: number;
	force: boolean;
	output: string;
	overwrite: boolean;
	png: boolean;
	props: string;
	quality: number;
	[jpegQualityOption.cliFlag]: TypeOfOption<typeof jpegQualityOption>;
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
	[enforceAudioOption.cliFlag]: TypeOfOption<typeof enforceAudioOption>;
	gl: OpenGlRenderer;
	['package-manager']: string;
	['webpack-poll']: number;
	['no-open']: boolean;
	['browser']: string;
	['browser-args']: string;
	['user-agent']: string;
	['out-dir']: string;
	[deleteAfterOption.cliFlag]: TypeOfOption<typeof deleteAfterOption>;
	[folderExpiryOption.cliFlag]: TypeOfOption<typeof folderExpiryOption>;
	[enableMultiprocessOnLinuxOption.cliFlag]: TypeOfOption<
		typeof enableMultiprocessOnLinuxOption
	>;
	repro: boolean;
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
	'repro',
];

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: BooleanFlags,
}) as CommandLineOptions & {
	_: string[];
};

export const parseCommandLine = () => {
	if (parsedCli.repro) {
		Config.setRepro(true);
	}

	if (parsedCli['pixel-format']) {
		Config.setPixelFormat(parsedCli['pixel-format']);
	}

	if (parsedCli['browser-executable']) {
		Config.setBrowserExecutable(parsedCli['browser-executable']);
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

	if (parsedCli['prores-profile']) {
		Config.setProResProfile(
			String(parsedCli['prores-profile']) as ProResProfile,
		);
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
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;
