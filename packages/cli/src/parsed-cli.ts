import type {
	AudioCodec,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import type {TypeOfOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';

const {
	allowHtmlInCanvasOption,
	benchmarkConcurrenciesOption,
	beepOnFinishOption,
	colorSpaceOption,
	concurrencyOption,
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
	ipv4Option,
	pixelFormatOption,
	browserExecutableOption,
	everyNthFrameOption,
	proResProfileOption,
	userAgentOption,
	disableWebSecurityOption,
	ignoreCertificateErrorsOption,
	overrideHeightOption,
	overrideWidthOption,
	overrideFpsOption,
	overrideDurationOption,
	outDirOption,
	packageManagerOption,
	webpackPollOption,
	keyboardShortcutsOption,
	experimentalClientSideRenderingOption,
	imageSequencePatternOption,
	scaleOption,
	overwriteOption,
	crfOption,
	logLevelOption,
	videoCodecOption,
	stillFrameOption,
	imageSequenceOption,
	versionFlagOption,
	bundleCacheOption,
	envFileOption,
	glOption,
	gopSizeOption,
	runsOption,
	reproOption,
	mutedOption,
	headlessOption,
	disableGitSourceOption,
	delayRenderTimeoutInMillisecondsOption,
	framesOption,
	forSeamlessAacConcatenationOption,
	isProductionOption,
	noOpenOption,
	portOption,
	propsOption,
	configOption,
	browserOption,
	sampleRateOption,
	previewSampleRateOption,
} = BrowserSafeApis.options;

export type CommandLineOptions = {
	[browserExecutableOption.cliFlag]: TypeOfOption<
		typeof browserExecutableOption
	>;
	[pixelFormatOption.cliFlag]: TypeOfOption<typeof pixelFormatOption>;
	['image-format']: VideoImageFormat | StillImageFormat;
	[proResProfileOption.cliFlag]: TypeOfOption<typeof proResProfileOption>;
	[x264Option.cliFlag]: TypeOfOption<typeof x264Option>;
	[bundleCacheOption.cliFlag]: TypeOfOption<typeof bundleCacheOption>;
	[envFileOption.cliFlag]: TypeOfOption<typeof envFileOption>;
	[ignoreCertificateErrorsOption.cliFlag]: TypeOfOption<
		typeof ignoreCertificateErrorsOption
	> | null;
	[darkModeOption.cliFlag]: TypeOfOption<typeof darkModeOption> | null;
	[disableWebSecurityOption.cliFlag]: TypeOfOption<
		typeof disableWebSecurityOption
	> | null;
	[everyNthFrameOption.cliFlag]: TypeOfOption<typeof everyNthFrameOption>;
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
	> | null;
	[beepOnFinishOption.cliFlag]: TypeOfOption<typeof beepOnFinishOption> | null;
	[versionFlagOption.cliFlag]: TypeOfOption<typeof versionFlagOption>;
	[videoCodecOption.cliFlag]: TypeOfOption<typeof videoCodecOption>;
	[concurrencyOption.cliFlag]: TypeOfOption<typeof concurrencyOption>;
	[delayRenderTimeoutInMillisecondsOption.cliFlag]: TypeOfOption<
		typeof delayRenderTimeoutInMillisecondsOption
	>;
	[configOption.cliFlag]: TypeOfOption<typeof configOption>;
	['public-dir']: string;
	[audioBitrateOption.cliFlag]: TypeOfOption<typeof audioBitrateOption>;
	[videoBitrateOption.cliFlag]: TypeOfOption<typeof videoBitrateOption>;
	[encodingBufferSizeOption.cliFlag]: TypeOfOption<
		typeof encodingBufferSizeOption
	>;
	[encodingMaxRateOption.cliFlag]: TypeOfOption<typeof encodingMaxRateOption>;
	[audioCodecOption.cliFlag]: AudioCodec;
	[publicPathOption.cliFlag]: string;
	[crfOption.cliFlag]: TypeOfOption<typeof crfOption>;
	[gopSizeOption.cliFlag]: TypeOfOption<typeof gopSizeOption>;
	output: string | undefined;
	[overwriteOption.cliFlag]: TypeOfOption<typeof overwriteOption> | null;
	png: boolean;
	[propsOption.cliFlag]: TypeOfOption<typeof propsOption>;
	quality: number;
	[jpegQualityOption.cliFlag]: TypeOfOption<typeof jpegQualityOption>;
	[framesOption.cliFlag]: string | number;
	[scaleOption.cliFlag]: TypeOfOption<typeof scaleOption>;
	[imageSequenceOption.cliFlag]: TypeOfOption<
		typeof imageSequenceOption
	> | null;
	quiet: boolean;
	q: boolean;
	[logLevelOption.cliFlag]: TypeOfOption<typeof logLevelOption>;
	help: boolean;
	[portOption.cliFlag]: TypeOfOption<typeof portOption>;
	[stillFrameOption.cliFlag]: TypeOfOption<typeof stillFrameOption>;
	[headlessOption.cliFlag]: TypeOfOption<typeof headlessOption> | null;
	[keyboardShortcutsOption.cliFlag]: TypeOfOption<
		typeof keyboardShortcutsOption
	> | null;
	[allowHtmlInCanvasOption.cliFlag]: TypeOfOption<
		typeof allowHtmlInCanvasOption
	>;
	[experimentalClientSideRenderingOption.cliFlag]: TypeOfOption<
		typeof experimentalClientSideRenderingOption
	>;
	[mutedOption.cliFlag]: TypeOfOption<typeof mutedOption>;
	[overrideHeightOption.cliFlag]: TypeOfOption<typeof overrideHeightOption>;
	[overrideWidthOption.cliFlag]: TypeOfOption<typeof overrideWidthOption>;
	[overrideFpsOption.cliFlag]: TypeOfOption<typeof overrideFpsOption>;
	[overrideDurationOption.cliFlag]: TypeOfOption<typeof overrideDurationOption>;
	[runsOption.cliFlag]: TypeOfOption<typeof runsOption>;
	[benchmarkConcurrenciesOption.cliFlag]: TypeOfOption<
		typeof benchmarkConcurrenciesOption
	>;
	[enforceAudioOption.cliFlag]: TypeOfOption<typeof enforceAudioOption>;
	[glOption.cliFlag]: TypeOfOption<typeof glOption>;
	[packageManagerOption.cliFlag]: TypeOfOption<typeof packageManagerOption>;
	[webpackPollOption.cliFlag]: TypeOfOption<typeof webpackPollOption>;
	[noOpenOption.cliFlag]: TypeOfOption<typeof noOpenOption>;
	[browserOption.cliFlag]: TypeOfOption<typeof browserOption>;
	['browser-args']: string;
	[userAgentOption.cliFlag]: TypeOfOption<typeof userAgentOption>;
	[outDirOption.cliFlag]: TypeOfOption<typeof outDirOption>;
	[audioLatencyHintOption.cliFlag]: AudioContextLatencyCategory;
	[ipv4Option.cliFlag]: TypeOfOption<typeof ipv4Option> | null;
	[deleteAfterOption.cliFlag]: TypeOfOption<typeof deleteAfterOption>;
	[folderExpiryOption.cliFlag]: TypeOfOption<typeof folderExpiryOption>;
	[enableMultiprocessOnLinuxOption.cliFlag]: TypeOfOption<
		typeof enableMultiprocessOnLinuxOption
	>;
	[reproOption.cliFlag]: TypeOfOption<typeof reproOption> | null;
	[imageSequencePatternOption.cliFlag]: TypeOfOption<
		typeof imageSequencePatternOption
	>;
	'license-key': string;
	[publicLicenseKeyOption.cliFlag]: string;
	[forceNewStudioOption.cliFlag]: TypeOfOption<
		typeof forceNewStudioOption
	> | null;
	[sampleRateOption.cliFlag]: TypeOfOption<typeof sampleRateOption>;
	[previewSampleRateOption.cliFlag]: TypeOfOption<
		typeof previewSampleRateOption
	>;
	[isProductionOption.cliFlag]: TypeOfOption<typeof isProductionOption> | null;
};

export const BooleanFlags = [
	overwriteOption.cliFlag,
	imageSequenceOption.cliFlag,
	'help',
	'quiet',
	'q',
	mutedOption.cliFlag,
	enforceAudioOption.cliFlag,
	disableWebSecurityOption.cliFlag,
	darkModeOption.cliFlag,
	ignoreCertificateErrorsOption.cliFlag,
	headlessOption.cliFlag,
	keyboardShortcutsOption.cliFlag,
	allowHtmlInCanvasOption.cliFlag,
	experimentalClientSideRenderingOption.cliFlag,
	ipv4Option.cliFlag,
	beepOnFinishOption.cliFlag,
	disableGitSourceOption.cliFlag,
	disallowParallelEncodingOption.cliFlag,
	forSeamlessAacConcatenationOption.cliFlag,
	reproOption.cliFlag,
	isProductionOption.cliFlag,
	forceNewStudioOption.cliFlag,
	bundleCacheOption.cliFlag,
];

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: BooleanFlags,
	default: {
		[overwriteOption.cliFlag]: null,
		[bundleCacheOption.cliFlag]: null,
		[allowHtmlInCanvasOption.cliFlag]: null,
		[experimentalClientSideRenderingOption.cliFlag]: null,
		[darkModeOption.cliFlag]: null,
		[imageSequenceOption.cliFlag]: null,
		[disableWebSecurityOption.cliFlag]: null,
		[ignoreCertificateErrorsOption.cliFlag]: null,
		[headlessOption.cliFlag]: null,
		[keyboardShortcutsOption.cliFlag]: null,
		[ipv4Option.cliFlag]: null,
		[beepOnFinishOption.cliFlag]: null,
		[disallowParallelEncodingOption.cliFlag]: null,
		[reproOption.cliFlag]: null,
		[isProductionOption.cliFlag]: null,
		[forceNewStudioOption.cliFlag]: null,
		[mutedOption.cliFlag]: null,
	},
}) as CommandLineOptions & {
	_: string[];
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;
