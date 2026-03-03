import {BrowserSafeApis} from '@remotion/renderer/client';
import type {PackageManager, RenderDefaults} from '@remotion/studio-shared';

type CommandType = 'render' | 'still';

export const getRemotionCommandPrefix = (
	packageManager: PackageManager | 'unknown',
) => {
	switch (packageManager) {
		case 'bun':
			return 'bunx remotion';
		case 'pnpm':
			return 'pnpm exec remotion';
		case 'yarn':
			return 'yarn remotion';
		case 'npm':
		case 'unknown':
			return 'npx remotion';
		default:
			return 'npx remotion';
	}
};

const shellQuote = (value: string) => {
	return `'${value.replace(/'/g, "'\\''")}'`;
};

const addFlagWithValue = (
	flags: string[],
	flag: string,
	value: string | number | null | undefined,
) => {
	if (value === null || value === undefined) {
		return;
	}

	flags.push(`--${flag}=${shellQuote(String(value))}`);
};

const addBooleanFlag = (flags: string[], flag: string, value: boolean) => {
	if (value) {
		flags.push(`--${flag}`);
	}
};

const getRenderFlags = ({
	renderDefaults,
	inFrameMark,
	outFrameMark,
}: {
	renderDefaults: RenderDefaults;
	inFrameMark: number | null;
	outFrameMark: number | null;
}) => {
	const {options} = BrowserSafeApis;
	const flags: string[] = [];

	if (
		inFrameMark !== null &&
		outFrameMark !== null &&
		inFrameMark <= outFrameMark
	) {
		addFlagWithValue(
			flags,
			options.framesOption.cliFlag,
			`${inFrameMark}-${outFrameMark}`,
		);
	}

	addFlagWithValue(
		flags,
		options.videoCodecOption.cliFlag,
		renderDefaults.codec,
	);
	addFlagWithValue(
		flags,
		options.audioCodecOption.cliFlag,
		renderDefaults.audioCodec,
	);
	addFlagWithValue(
		flags,
		options.videoImageFormatOption.cliFlag,
		renderDefaults.videoImageFormat,
	);
	addFlagWithValue(
		flags,
		options.concurrencyOption.cliFlag,
		renderDefaults.concurrency,
	);
	addFlagWithValue(
		flags,
		options.pixelFormatOption.cliFlag,
		renderDefaults.pixelFormat,
	);
	addFlagWithValue(
		flags,
		options.videoBitrateOption.cliFlag,
		renderDefaults.videoBitrate,
	);
	addFlagWithValue(
		flags,
		options.audioBitrateOption.cliFlag,
		renderDefaults.audioBitrate,
	);
	addFlagWithValue(
		flags,
		options.encodingBufferSizeOption.cliFlag,
		renderDefaults.encodingBufferSize,
	);
	addFlagWithValue(
		flags,
		options.encodingMaxRateOption.cliFlag,
		renderDefaults.encodingMaxRate,
	);
	addFlagWithValue(
		flags,
		options.everyNthFrameOption.cliFlag,
		renderDefaults.everyNthFrame,
	);
	addFlagWithValue(
		flags,
		options.numberOfGifLoopsOption.cliFlag,
		renderDefaults.numberOfGifLoops,
	);
	addFlagWithValue(
		flags,
		options.proResProfileOption.cliFlag,
		renderDefaults.proResProfile,
	);
	addFlagWithValue(
		flags,
		options.x264Option.cliFlag,
		renderDefaults.x264Preset,
	);
	addFlagWithValue(
		flags,
		options.colorSpaceOption.cliFlag,
		renderDefaults.colorSpace,
	);
	addBooleanFlag(flags, options.mutedOption.cliFlag, renderDefaults.muted);
	addBooleanFlag(
		flags,
		options.enforceAudioOption.cliFlag,
		renderDefaults.enforceAudioTrack,
	);
	addBooleanFlag(flags, options.reproOption.cliFlag, renderDefaults.repro);
	addBooleanFlag(
		flags,
		options.forSeamlessAacConcatenationOption.cliFlag,
		renderDefaults.forSeamlessAacConcatenation,
	);
	addBooleanFlag(
		flags,
		options.enableMultiprocessOnLinuxOption.cliFlag,
		renderDefaults.multiProcessOnLinux,
	);

	return flags;
};

const getStillFlags = ({
	renderDefaults,
	frame,
}: {
	renderDefaults: RenderDefaults;
	frame: number;
}) => {
	const {options} = BrowserSafeApis;
	const flags: string[] = [];

	addFlagWithValue(flags, options.stillFrameOption.cliFlag, frame);
	addFlagWithValue(
		flags,
		options.stillImageFormatOption.cliFlag,
		renderDefaults.stillImageFormat,
	);

	return flags;
};

const getSharedFlags = ({renderDefaults}: {renderDefaults: RenderDefaults}) => {
	const {options} = BrowserSafeApis;
	const flags: string[] = [];

	addFlagWithValue(
		flags,
		options.jpegQualityOption.cliFlag,
		renderDefaults.jpegQuality,
	);
	addFlagWithValue(flags, options.scaleOption.cliFlag, renderDefaults.scale);
	addFlagWithValue(
		flags,
		options.logLevelOption.cliFlag,
		renderDefaults.logLevel,
	);
	addFlagWithValue(
		flags,
		options.delayRenderTimeoutInMillisecondsOption.cliFlag,
		renderDefaults.delayRenderTimeout,
	);
	addFlagWithValue(
		flags,
		options.glOption.cliFlag,
		renderDefaults.openGlRenderer,
	);
	addFlagWithValue(
		flags,
		options.userAgentOption.cliFlag,
		renderDefaults.userAgent,
	);
	addFlagWithValue(
		flags,
		options.chromeModeOption.cliFlag,
		renderDefaults.chromeMode,
	);
	addFlagWithValue(
		flags,
		options.hardwareAccelerationOption.cliFlag,
		renderDefaults.hardwareAcceleration,
	);
	addFlagWithValue(
		flags,
		options.mediaCacheSizeInBytesOption.cliFlag,
		renderDefaults.mediaCacheSizeInBytes,
	);
	addFlagWithValue(
		flags,
		options.offthreadVideoCacheSizeInBytesOption.cliFlag,
		renderDefaults.offthreadVideoCacheSizeInBytes,
	);
	addFlagWithValue(
		flags,
		options.offthreadVideoThreadsOption.cliFlag,
		renderDefaults.offthreadVideoThreads,
	);
	addFlagWithValue(
		flags,
		options.licenseKeyOption.cliFlag,
		renderDefaults.publicLicenseKey,
	);
	addBooleanFlag(
		flags,
		options.disableWebSecurityOption.cliFlag,
		renderDefaults.disableWebSecurity,
	);
	addBooleanFlag(
		flags,
		options.ignoreCertificateErrorsOption.cliFlag,
		renderDefaults.ignoreCertificateErrors,
	);
	addBooleanFlag(
		flags,
		options.darkModeOption.cliFlag,
		renderDefaults.darkMode,
	);
	if (!renderDefaults.headless) {
		addBooleanFlag(flags, options.headlessOption.cliFlag, true);
	}

	return flags;
};

export const makeRenderCommand = ({
	commandType,
	packageManager,
	serveUrl,
	compositionId,
	inputProps,
	renderDefaults,
	inFrameMark,
	outFrameMark,
	frame,
}: {
	commandType: CommandType;
	packageManager: PackageManager | 'unknown';
	serveUrl: string;
	compositionId: string;
	inputProps: Record<string, unknown>;
	renderDefaults: RenderDefaults;
	inFrameMark: number | null;
	outFrameMark: number | null;
	frame: number;
}) => {
	const command = getRemotionCommandPrefix(packageManager);
	const sharedFlags = getSharedFlags({renderDefaults});
	const renderSpecificFlags =
		commandType === 'render'
			? getRenderFlags({renderDefaults, inFrameMark, outFrameMark})
			: getStillFlags({renderDefaults, frame});
	const inputPropsString = JSON.stringify(inputProps) ?? '{}';
	const propsFlag = `--${BrowserSafeApis.options.propsOption.cliFlag}=${shellQuote(
		inputPropsString,
	)}`;

	return [
		command,
		commandType,
		shellQuote(serveUrl),
		shellQuote(compositionId),
		...sharedFlags,
		...renderSpecificFlags,
		propsFlag,
	].join(' ');
};
