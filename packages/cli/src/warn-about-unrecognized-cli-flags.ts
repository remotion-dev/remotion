import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Log} from './log';

const {
	askAIOption,
	audioBitrateOption,
	audioCodecOption,
	audioLatencyHintOption,
	beepOnFinishOption,
	binariesDirectoryOption,
	browserExecutableOption,
	browserOption,
	bundleCacheOption,
	chromeModeOption,
	colorSpaceOption,
	concurrencyOption,
	configOption,
	crfOption,
	darkModeOption,
	delayRenderTimeoutInMillisecondsOption,
	disableGitSourceOption,
	disableWebSecurityOption,
	disallowParallelEncodingOption,
	enableCrossSiteIsolationOption,
	enableMultiprocessOnLinuxOption,
	encodingBufferSizeOption,
	encodingMaxRateOption,
	enforceAudioOption,
	envFileOption,
	everyNthFrameOption,
	forSeamlessAacConcatenationOption,
	forceNewStudioOption,
	framesOption,
	glOption,
	gopSizeOption,
	hardwareAccelerationOption,
	headlessOption,
	ignoreCertificateErrorsOption,
	imageSequenceOption,
	imageSequencePatternOption,
	interactivityOption,
	ipv4Option,
	jpegQualityOption,
	keyboardShortcutsOption,
	licenseKeyOption,
	logLevelOption,
	mediaCacheSizeInBytesOption,
	metadataOption,
	mutedOption,
	noOpenOption,
	numberOfGifLoopsOption,
	numberOfSharedAudioTagsOption,
	offthreadVideoCacheSizeInBytesOption,
	offthreadVideoThreadsOption,
	overrideDurationOption,
	overrideFpsOption,
	overrideHeightOption,
	overrideWidthOption,
	overwriteOption,
	pixelFormatOption,
	portOption,
	previewSampleRateOption,
	propsOption,
	proResProfileOption,
	publicDirOption,
	publicLicenseKeyOption,
	publicPathOption,
	reproOption,
	rspackOption,
	sampleRateOption,
	scaleOption,
	separateAudioOption,
	stillFrameOption,
	userAgentOption,
	videoBitrateOption,
	videoCodecOption,
	videoImageFormatOption,
	webpackPollOption,
	x264Option,
} = BrowserSafeApis.options;

const commonFlags = [
	configOption.cliFlag,
	envFileOption.cliFlag,
	licenseKeyOption.cliFlag,
	logLevelOption.cliFlag,
	propsOption.cliFlag,
];

const studioFlags = [
	...commonFlags,
	askAIOption.cliFlag,
	audioBitrateOption.cliFlag,
	audioCodecOption.cliFlag,
	audioLatencyHintOption.cliFlag,
	beepOnFinishOption.cliFlag,
	binariesDirectoryOption.cliFlag,
	'browser-args',
	browserOption.cliFlag,
	browserExecutableOption.cliFlag,
	bundleCacheOption.cliFlag,
	chromeModeOption.cliFlag,
	colorSpaceOption.cliFlag,
	concurrencyOption.cliFlag,
	darkModeOption.cliFlag,
	delayRenderTimeoutInMillisecondsOption.cliFlag,
	disableGitSourceOption.cliFlag,
	disableWebSecurityOption.cliFlag,
	enableCrossSiteIsolationOption.cliFlag,
	enableMultiprocessOnLinuxOption.cliFlag,
	encodingBufferSizeOption.cliFlag,
	encodingMaxRateOption.cliFlag,
	enforceAudioOption.cliFlag,
	everyNthFrameOption.cliFlag,
	forSeamlessAacConcatenationOption.cliFlag,
	forceNewStudioOption.cliFlag,
	glOption.cliFlag,
	gopSizeOption.cliFlag,
	hardwareAccelerationOption.cliFlag,
	headlessOption.cliFlag,
	ignoreCertificateErrorsOption.cliFlag,
	interactivityOption.cliFlag,
	ipv4Option.cliFlag,
	jpegQualityOption.cliFlag,
	keyboardShortcutsOption.cliFlag,
	mediaCacheSizeInBytesOption.cliFlag,
	mutedOption.cliFlag,
	noOpenOption.cliFlag,
	numberOfGifLoopsOption.cliFlag,
	numberOfSharedAudioTagsOption.cliFlag,
	offthreadVideoCacheSizeInBytesOption.cliFlag,
	offthreadVideoThreadsOption.cliFlag,
	'output',
	pixelFormatOption.cliFlag,
	portOption.cliFlag,
	previewSampleRateOption.cliFlag,
	proResProfileOption.cliFlag,
	publicDirOption.cliFlag,
	publicLicenseKeyOption.cliFlag,
	'q',
	'quiet',
	reproOption.cliFlag,
	rspackOption.cliFlag,
	sampleRateOption.cliFlag,
	scaleOption.cliFlag,
	userAgentOption.cliFlag,
	videoBitrateOption.cliFlag,
	videoCodecOption.cliFlag,
	videoImageFormatOption.cliFlag,
	webpackPollOption.cliFlag,
	x264Option.cliFlag,
];

const renderFlags = [
	...commonFlags,
	askAIOption.cliFlag,
	audioBitrateOption.cliFlag,
	audioCodecOption.cliFlag,
	audioLatencyHintOption.cliFlag,
	binariesDirectoryOption.cliFlag,
	browserExecutableOption.cliFlag,
	bundleCacheOption.cliFlag,
	chromeModeOption.cliFlag,
	colorSpaceOption.cliFlag,
	concurrencyOption.cliFlag,
	crfOption.cliFlag,
	darkModeOption.cliFlag,
	delayRenderTimeoutInMillisecondsOption.cliFlag,
	disableWebSecurityOption.cliFlag,
	disallowParallelEncodingOption.cliFlag,
	enableMultiprocessOnLinuxOption.cliFlag,
	encodingBufferSizeOption.cliFlag,
	encodingMaxRateOption.cliFlag,
	enforceAudioOption.cliFlag,
	everyNthFrameOption.cliFlag,
	forSeamlessAacConcatenationOption.cliFlag,
	framesOption.cliFlag,
	glOption.cliFlag,
	gopSizeOption.cliFlag,
	hardwareAccelerationOption.cliFlag,
	headlessOption.cliFlag,
	ignoreCertificateErrorsOption.cliFlag,
	imageSequenceOption.cliFlag,
	imageSequencePatternOption.cliFlag,
	jpegQualityOption.cliFlag,
	keyboardShortcutsOption.cliFlag,
	mediaCacheSizeInBytesOption.cliFlag,
	metadataOption.cliFlag,
	mutedOption.cliFlag,
	numberOfGifLoopsOption.cliFlag,
	offthreadVideoCacheSizeInBytesOption.cliFlag,
	offthreadVideoThreadsOption.cliFlag,
	'output',
	overrideDurationOption.cliFlag,
	overrideFpsOption.cliFlag,
	overrideHeightOption.cliFlag,
	overrideWidthOption.cliFlag,
	overwriteOption.cliFlag,
	pixelFormatOption.cliFlag,
	portOption.cliFlag,
	proResProfileOption.cliFlag,
	publicDirOption.cliFlag,
	publicPathOption.cliFlag,
	'q',
	'quiet',
	reproOption.cliFlag,
	rspackOption.cliFlag,
	sampleRateOption.cliFlag,
	scaleOption.cliFlag,
	separateAudioOption.cliFlag,
	stillFrameOption.cliFlag,
	userAgentOption.cliFlag,
	videoBitrateOption.cliFlag,
	videoCodecOption.cliFlag,
	videoImageFormatOption.cliFlag,
	x264Option.cliFlag,
];

export type CommandWithRecognizedFlags = 'render' | 'studio';

export const getUnrecognizedCliFlags = ({
	args,
	command,
}: {
	args: string[];
	command: CommandWithRecognizedFlags;
}) => {
	const recognizedFlags = new Set<string>(
		command === 'studio' ? studioFlags : renderFlags,
	);
	const passedFlags = new Set<string>();

	for (const arg of args) {
		if (arg === '--') {
			break;
		}

		if (arg.startsWith('--') && arg.length > 2) {
			const flag = arg.slice(2);
			const equalsSign = flag.indexOf('=');
			passedFlags.add(equalsSign === -1 ? flag : flag.slice(0, equalsSign));
		} else if (/^-[a-zA-Z]/.test(arg)) {
			const flag = arg.slice(1);
			const equalsSign = flag.indexOf('=');
			passedFlags.add(equalsSign === -1 ? flag : flag.slice(0, equalsSign));
		}
	}

	return [...passedFlags].filter((flag) => !recognizedFlags.has(flag));
};

export const warnAboutUnrecognizedCliFlags = ({
	args,
	command,
	logLevel,
}: {
	args: string[];
	command: CommandWithRecognizedFlags;
	logLevel: LogLevel;
}) => {
	const unrecognizedFlags = getUnrecognizedCliFlags({args, command});

	for (const flag of unrecognizedFlags) {
		Log.warn(
			{indent: false, logLevel},
			`"--${flag}" is not a valid flag for "npx remotion ${command}". This will fail in the future.`,
		);
	}
};
