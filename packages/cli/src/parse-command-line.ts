import type {
	AudioCodec,
	BrowserExecutable,
	Codec,
	OpenGlRenderer,
	PixelFormat,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type {TypeOfOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {_InternalTypes} from 'remotion';
import {Config, ConfigInternals} from './config';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const {
	beepOnFinishOption,
	colorSpaceOption,
	disallowParallelEncodingOption,
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
	audioCodecOption,
	publicPathOption,
	audioLatencyHintOption,
	darkModeOption,
	publicLicenseKeyOption,
	forceNewStudioOption,
	numberOfSharedAudioTagsOption,
} = BrowserSafeApis.options;

export type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: VideoImageFormat | StillImageFormat;
	['prores-profile']: _InternalTypes['ProResProfile'];
	[x264Option.cliFlag]: TypeOfOption<typeof x264Option>;
	['bundle-cache']: string;
	['env-file']: string;
	['ignore-certificate-errors']: string;
	[darkModeOption.cliFlag]: TypeOfOption<typeof darkModeOption>;
	['disable-web-security']: string;
	['every-nth-frame']: number;
	[numberOfGifLoopsOption.cliFlag]: TypeOfOption<typeof numberOfGifLoopsOption>;
	[numberOfSharedAudioTagsOption.cliFlag]: TypeOfOption<
		typeof numberOfSharedAudioTagsOption
	>;
	[offthreadVideoCacheSizeInBytesOption.cliFlag]: TypeOfOption<
		typeof offthreadVideoCacheSizeInBytesOption
	>;
	[colorSpaceOption.cliFlag]: TypeOfOption<typeof colorSpaceOption>;
	[disallowParallelEncodingOption.cliFlag]: TypeOfOption<
		typeof disallowParallelEncodingOption
	>;
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
	[audioCodecOption.cliFlag]: AudioCodec;
	[publicPathOption.cliFlag]: string;
	crf: number;
	force: boolean;
	output: string | undefined;
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
	['enable-experimental-client-side-rendering']: boolean;
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
	[audioLatencyHintOption.cliFlag]: AudioContextLatencyCategory;
	ipv4: boolean;
	[deleteAfterOption.cliFlag]: TypeOfOption<typeof deleteAfterOption>;
	[folderExpiryOption.cliFlag]: TypeOfOption<typeof folderExpiryOption>;
	[enableMultiprocessOnLinuxOption.cliFlag]: TypeOfOption<
		typeof enableMultiprocessOnLinuxOption
	>;
	repro: boolean;
	'image-sequence-pattern': string;
	'license-key': string;
	[publicLicenseKeyOption.cliFlag]: string;
	[forceNewStudioOption.cliFlag]: TypeOfOption<typeof forceNewStudioOption>;
};

export const parseCommandLine = () => {
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

	if (parsedCli[darkModeOption.cliFlag]) {
		Config.setChromiumDarkMode(parsedCli[darkModeOption.cliFlag]);
	}

	if (parsedCli['user-agent']) {
		Config.setChromiumUserAgent(parsedCli['user-agent']);
	}

	if (parsedCli.concurrency) {
		Config.setConcurrency(parsedCli.concurrency);
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

	if (parsedCli['every-nth-frame']) {
		Config.setEveryNthFrame(parsedCli['every-nth-frame']);
	}

	if (parsedCli['prores-profile']) {
		Config.setProResProfile(
			String(parsedCli['prores-profile']) as _InternalTypes['ProResProfile'],
		);
	}

	if (
		parsedCli['license-key'] &&
		parsedCli['license-key'].startsWith('rm_pub_')
	) {
		Config.setPublicLicenseKey(parsedCli['license-key']);
	}

	if (parsedCli['public-license-key']) {
		Config.setPublicLicenseKey(parsedCli['public-license-key']);
	}

	if (typeof parsedCli.quality !== 'undefined') {
		Log.warn(
			{indent: false, logLevel: 'info'},
			'The --quality flag has been renamed to --jpeg-quality instead.',
		);
		Config.setJpegQuality(parsedCli.quality);
	}

	if (typeof parsedCli.scale !== 'undefined') {
		Config.setScale(parsedCli.scale);
	}

	if (
		typeof parsedCli['enable-experimental-client-side-rendering'] !==
		'undefined'
	) {
		Config.setExperimentalClientSideRenderingEnabled(
			parsedCli['enable-experimental-client-side-rendering'],
		);
	}

	if (typeof parsedCli['webpack-poll'] !== 'undefined') {
		Config.setWebpackPollingInMilliseconds(parsedCli['webpack-poll']);
	}
};
