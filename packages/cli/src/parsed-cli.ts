import type {AudioCodec} from '@remotion/renderer';
import type {TypeOfOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';
import {Log} from './log';

const {
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
	runsOption,
	reproOption,
	mutedOption,
	headlessOption,
	disableGitSourceOption,
	framesOption,
	forSeamlessAacConcatenationOption,
	isProductionOption,
	noOpenOption,
	portOption,
	propsOption,
	configOption,
	browserOption,
	browserArgsOption,
	concurrenciesOption,
	helpOption,
	quietOption,
	qualityOption,
	pngOption,
	outputOption,
	imageFormatOption,
	forceOption,
} = BrowserSafeApis.options;

export type CommandLineOptions = {
	[browserExecutableOption.cliFlag]: TypeOfOption<
		typeof browserExecutableOption
	>;
	[pixelFormatOption.cliFlag]: TypeOfOption<typeof pixelFormatOption>;
	// ['image-format']: VideoImageFormat | StillImageFormat;
	[proResProfileOption.cliFlag]: TypeOfOption<typeof proResProfileOption>;
	[x264Option.cliFlag]: TypeOfOption<typeof x264Option>;
	[bundleCacheOption.cliFlag]: TypeOfOption<typeof bundleCacheOption>;
	[envFileOption.cliFlag]: TypeOfOption<typeof envFileOption>;
	[ignoreCertificateErrorsOption.cliFlag]: TypeOfOption<
		typeof ignoreCertificateErrorsOption
	>;
	[darkModeOption.cliFlag]: TypeOfOption<typeof darkModeOption>;
	[disableWebSecurityOption.cliFlag]: TypeOfOption<
		typeof disableWebSecurityOption
	>;
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
	>;
	[beepOnFinishOption.cliFlag]: TypeOfOption<typeof beepOnFinishOption>;
	[versionFlagOption.cliFlag]: TypeOfOption<typeof versionFlagOption>;
	[videoCodecOption.cliFlag]: TypeOfOption<typeof videoCodecOption>;
	[concurrencyOption.cliFlag]: TypeOfOption<typeof concurrencyOption>;
	timeout: number;
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
	// force: boolean;
	// output: string | undefined;
	[overwriteOption.cliFlag]: TypeOfOption<typeof overwriteOption>;
	// png: boolean;
	[propsOption.cliFlag]: TypeOfOption<typeof propsOption>;
	// quality: number;
	[jpegQualityOption.cliFlag]: TypeOfOption<typeof jpegQualityOption>;
	[framesOption.cliFlag]: string | number;
	[scaleOption.cliFlag]: TypeOfOption<typeof scaleOption>;
	[imageSequenceOption.cliFlag]: TypeOfOption<typeof imageSequenceOption>;
	// quiet: boolean;
	q: boolean;
	[logLevelOption.cliFlag]: TypeOfOption<typeof logLevelOption>;
	// help: boolean;
	[portOption.cliFlag]: TypeOfOption<typeof portOption>;
	[stillFrameOption.cliFlag]: TypeOfOption<typeof stillFrameOption>;
	[headlessOption.cliFlag]: TypeOfOption<typeof headlessOption>;
	[keyboardShortcutsOption.cliFlag]: TypeOfOption<
		typeof keyboardShortcutsOption
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
	// concurrencies: string;
	[enforceAudioOption.cliFlag]: TypeOfOption<typeof enforceAudioOption>;
	[glOption.cliFlag]: TypeOfOption<typeof glOption>;
	[packageManagerOption.cliFlag]: TypeOfOption<typeof packageManagerOption>;
	[webpackPollOption.cliFlag]: TypeOfOption<typeof webpackPollOption>;
	[noOpenOption.cliFlag]: TypeOfOption<typeof noOpenOption>;
	[browserOption.cliFlag]: TypeOfOption<typeof browserOption>;
	[outputOption.cliFlag]: TypeOfOption<typeof outputOption>;
	[pngOption.cliFlag]: TypeOfOption<typeof pngOption>;
	// ['browser-args']:string,
	[browserArgsOption.cliFlag]: TypeOfOption<typeof browserArgsOption>;
	[qualityOption.cliFlag]: TypeOfOption<typeof qualityOption>;
	[quietOption.cliFlag]: TypeOfOption<typeof quietOption>;
	[helpOption.cliFlag]: TypeOfOption<typeof helpOption>;
	[imageFormatOption.cliFlag]: TypeOfOption<typeof imageFormatOption>;
	[forceOption.cliFlag]: TypeOfOption<typeof forceOption>;
	[concurrenciesOption.cliFlag]: TypeOfOption<typeof concurrenciesOption>;
	[outDirOption.cliFlag]: TypeOfOption<typeof outDirOption>;
	[userAgentOption.cliFlag]: TypeOfOption<typeof userAgentOption>;
	[audioLatencyHintOption.cliFlag]: AudioContextLatencyCategory;
	[ipv4Option.cliFlag]: TypeOfOption<typeof ipv4Option>;
	[deleteAfterOption.cliFlag]: TypeOfOption<typeof deleteAfterOption>;
	[folderExpiryOption.cliFlag]: TypeOfOption<typeof folderExpiryOption>;
	[enableMultiprocessOnLinuxOption.cliFlag]: TypeOfOption<
		typeof enableMultiprocessOnLinuxOption
	>;
	[reproOption.cliFlag]: TypeOfOption<typeof reproOption>;
	[imageSequencePatternOption.cliFlag]: TypeOfOption<
		typeof imageSequencePatternOption
	>;
	'license-key': string;
	[publicLicenseKeyOption.cliFlag]: string;
	[forceNewStudioOption.cliFlag]: TypeOfOption<typeof forceNewStudioOption>;
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
		[overwriteOption.cliFlag]: true,
		[bundleCacheOption.cliFlag]: null,
		[experimentalClientSideRenderingOption.cliFlag]: null,
		[mutedOption.cliFlag]: null,
	},
}) as CommandLineOptions & {
	_: string[];
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;

const logLevel = BrowserSafeApis.options.logLevelOption.getValue({
	commandLine: parsedCli,
}).value;

export const warnAboutUnknownFlags = () => {
	const knownCliFlags = new Set(
		Object.values(BrowserSafeApis.options).map((o) => o.cliFlag),
	);
	knownCliFlags.add('q');
	const rawFlags: string[] = process.argv
		.slice(2)
		.filter((arg): arg is string => arg.startsWith('--'))
		.map((arg) => {
			const cleaned = arg.replace(/^-+/, '');
			const flag = cleaned.split('=')[0];
			return flag ?? '';
		})
		.filter(Boolean);

	for (const flag of rawFlags) {
		if (!knownCliFlags.has(flag)) {
			Log.warn(
				{indent: false, logLevel},
				`Unknown flag "--${flag}". See "remotion --help" for available options.`,
			);
		}
	}
};
