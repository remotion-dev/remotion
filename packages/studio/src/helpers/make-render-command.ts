import type {
	RenderFramesOptions,
	RenderMediaOptions,
	RenderStillOptions,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderDefaults} from '@remotion/studio-shared';
import type {renderMediaOnWeb} from '@remotion/web-renderer';

type RenderMode = 'still' | 'video' | 'audio' | 'sequence';

const shellQuote = (value: string) => {
	return `'${value.replace(/'/g, "'\\''")}'`;
};

const addFlagWithValue = (
	flags: string[],
	flag: string,
	value: string | number | boolean | null | undefined,
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

type ValueFlagMapping = {
	flag: string;
	value: string | number | boolean | null | undefined;
	defaultValue: string | number | boolean | null | undefined;
};

type BooleanFlagMapping = {
	flag: string;
	value: boolean;
	defaultValue: boolean;
};

const valueFlag = (
	flag: string,
	value: ValueFlagMapping['value'],
	defaultValue: ValueFlagMapping['defaultValue'],
): ValueFlagMapping => {
	return {flag, value, defaultValue};
};

const booleanFlag = (
	flag: string,
	value: boolean,
	defaultValue: boolean,
): BooleanFlagMapping => {
	return {flag, value, defaultValue};
};

const addValueFlagsIfChanged = (
	flags: string[],
	mappings: ValueFlagMapping[],
) => {
	for (const mapping of mappings) {
		if (mapping.value !== mapping.defaultValue) {
			addFlagWithValue(flags, mapping.flag, mapping.value);
		}
	}
};

const addTrueBooleanFlagsIfChanged = (
	flags: string[],
	mappings: BooleanFlagMapping[],
) => {
	for (const mapping of mappings) {
		if (mapping.value && mapping.value !== mapping.defaultValue) {
			addBooleanFlag(flags, mapping.flag, true);
		}
	}
};

export const getNpmRemotionCommandPrefix = (version: string) => {
	return version.trim() === ''
		? 'bunx --yes --location=global -p @remotion/cli remotion'
		: `bunx --yes --location=global -p @remotion/cli@${version} remotion`;
};

export const normalizeServeUrlForRenderCommand = ({
	locationHref,
	compositionId,
}: {
	locationHref: string;
	compositionId: string;
}) => {
	const parsed = new URL(locationHref);
	parsed.hash = '';
	parsed.search = '';

	const suffix = `/${compositionId}`;
	if (parsed.pathname === suffix) {
		parsed.pathname = '/';
	} else if (parsed.pathname.endsWith(suffix)) {
		const basePath = parsed.pathname.slice(0, -suffix.length);
		parsed.pathname = basePath === '' ? '/' : basePath;
	}

	if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
		parsed.pathname = parsed.pathname.slice(0, -1);
	}

	return `${parsed.origin}${parsed.pathname === '/' ? '' : parsed.pathname}`;
};

const trimDefaultOutPrefix = (outName: string) => {
	if (outName.startsWith('out/')) {
		const trimmed = outName.slice('out/'.length);
		return trimmed.length === 0 ? outName : trimmed;
	}

	if (outName.startsWith('./out/')) {
		const trimmed = outName.slice('./out/'.length);
		return trimmed.length === 0 ? outName : trimmed;
	}

	return outName;
};

const getRenderMediaFlag = (
	option: keyof typeof BrowserSafeApis.optionsMap.renderMedia,
) => {
	return BrowserSafeApis.optionsMap.renderMedia[option].cliFlag;
};

const renderMediaValueFlag = (
	option: keyof typeof BrowserSafeApis.optionsMap.renderMedia,
	value: ValueFlagMapping['value'],
	defaultValue: ValueFlagMapping['defaultValue'],
): ValueFlagMapping => {
	return valueFlag(getRenderMediaFlag(option), value, defaultValue);
};

const renderMediaBooleanFlag = (
	option: keyof typeof BrowserSafeApis.optionsMap.renderMedia,
	value: boolean,
	defaultValue: boolean,
): BooleanFlagMapping => {
	return booleanFlag(getRenderMediaFlag(option), value, defaultValue);
};

type StrictRequired<T> = {
	[K in keyof T]-?: Exclude<T[K], undefined>;
};

type RenderMediaCommandOptions = Omit<
	StrictRequired<
		Pick<
			RenderMediaOptions,
			| 'codec'
			| 'crf'
			| 'concurrency'
			| 'disallowParallelEncoding'
			| 'muted'
			| 'enforceAudioTrack'
			| 'everyNthFrame'
			| 'numberOfGifLoops'
			| 'colorSpace'
			| 'scale'
			| 'logLevel'
			| 'repro'
			| 'metadata'
			| 'jpegQuality'
			| 'pixelFormat'
			| 'proResProfile'
			| 'x264Preset'
			| 'audioCodec'
			| 'forSeamlessAacConcatenation'
			| 'separateAudioTo'
			| 'hardwareAcceleration'
			| 'chromeMode'
			| 'offthreadVideoCacheSizeInBytes'
			| 'offthreadVideoThreads'
			| 'mediaCacheSizeInBytes'
			| 'audioBitrate'
			| 'videoBitrate'
			| 'encodingMaxRate'
			| 'encodingBufferSize'
		>
	>,
	| 'audioBitrate'
	| 'videoBitrate'
	| 'encodingMaxRate'
	| 'encodingBufferSize'
	| 'jpegQuality'
	| 'proResProfile'
> & {
	// Studio currently stores these as freeform strings.
	audioBitrate: string | null;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	jpegQuality: Exclude<RenderMediaOptions['jpegQuality'], undefined> | null;
	proResProfile: Exclude<RenderMediaOptions['proResProfile'], undefined> | null;
};

type RenderStillCommandOptions = StrictRequired<
	Pick<RenderStillOptions, 'frame'>
>;
type RenderFramesSharedOptions = StrictRequired<
	Pick<
		RenderFramesOptions,
		'concurrency' | 'everyNthFrame' | 'scale' | 'logLevel'
	>
>;
type RenderMediaOnWebInput = Parameters<typeof renderMediaOnWeb>[0];
type CrossRendererOptions = StrictRequired<
	Pick<RenderMediaOnWebInput, 'muted' | 'scale' | 'logLevel'>
>;

type ReadOnlyStudioRenderCommandInput = RenderMediaCommandOptions &
	RenderStillCommandOptions &
	RenderFramesSharedOptions &
	CrossRendererOptions & {
		remotionVersion: string;
		locationHref: string;
		compositionId: string;
		outName: string;
		renderMode: RenderMode;
		renderDefaults: RenderDefaults;
		durationInFrames: number;
		startFrame: number;
		endFrame: number;
		stillImageFormat: RenderDefaults['stillImageFormat'];
		sequenceImageFormat: RenderDefaults['videoImageFormat'];
		videoImageFormat: RenderDefaults['videoImageFormat'];
		delayRenderTimeout: number;
		headless: boolean;
		disableWebSecurity: boolean;
		ignoreCertificateErrors: boolean;
		gl: RenderDefaults['openGlRenderer'];
		userAgent: string | null;
		multiProcessOnLinux: boolean;
		darkMode: boolean;
		beepOnFinish: boolean;
		envVariables: Record<string, string>;
		inputProps: Record<string, unknown>;
	};

export const makeReadOnlyStudioRenderCommand = ({
	remotionVersion,
	locationHref,
	compositionId,
	outName,
	renderMode,
	renderDefaults,
	durationInFrames,
	concurrency,
	frame,
	startFrame,
	endFrame,
	stillImageFormat,
	sequenceImageFormat,
	videoImageFormat,
	jpegQuality,
	codec,
	muted,
	enforceAudioTrack,
	proResProfile,
	x264Preset,
	pixelFormat,
	crf,
	videoBitrate,
	audioBitrate,
	audioCodec,
	everyNthFrame,
	numberOfGifLoops,
	disallowParallelEncoding,
	encodingBufferSize,
	encodingMaxRate,
	forSeamlessAacConcatenation,
	separateAudioTo,
	colorSpace,
	scale,
	logLevel,
	delayRenderTimeout,
	hardwareAcceleration,
	chromeMode,
	headless,
	disableWebSecurity,
	ignoreCertificateErrors,
	gl,
	userAgent,
	multiProcessOnLinux,
	darkMode,
	offthreadVideoCacheSizeInBytes,
	offthreadVideoThreads,
	mediaCacheSizeInBytes,
	beepOnFinish,
	repro,
	metadata,
	envVariables,
	inputProps,
}: ReadOnlyStudioRenderCommandInput) => {
	const serveUrl = normalizeServeUrlForRenderCommand({
		locationHref,
		compositionId,
	});
	const isStillRender = renderMode === 'still';
	const isSequenceRender = renderMode === 'sequence';
	const hasCodecSpecificOptions = !isSequenceRender;
	const commandType = isStillRender ? 'still' : 'render';
	const command = getNpmRemotionCommandPrefix(remotionVersion);
	const {options} = BrowserSafeApis;
	const flags: string[] = [];

	addValueFlagsIfChanged(flags, [
		valueFlag(options.scaleOption.cliFlag, scale, renderDefaults.scale),
		renderMediaValueFlag('logLevel', logLevel, renderDefaults.logLevel),
		renderMediaValueFlag(
			'timeoutInMilliseconds',
			delayRenderTimeout,
			renderDefaults.delayRenderTimeout,
		),
		renderMediaValueFlag('chromeMode', chromeMode, renderDefaults.chromeMode),
		valueFlag(options.glOption.cliFlag, gl, renderDefaults.openGlRenderer),
		valueFlag(
			options.userAgentOption.cliFlag,
			userAgent,
			renderDefaults.userAgent,
		),
		renderMediaValueFlag(
			'offthreadVideoCacheSizeInBytes',
			offthreadVideoCacheSizeInBytes,
			renderDefaults.offthreadVideoCacheSizeInBytes,
		),
		renderMediaValueFlag(
			'offthreadVideoThreads',
			offthreadVideoThreads,
			renderDefaults.offthreadVideoThreads,
		),
		renderMediaValueFlag(
			'mediaCacheSizeInBytes',
			mediaCacheSizeInBytes,
			renderDefaults.mediaCacheSizeInBytes,
		),
	]);

	if (headless !== renderDefaults.headless) {
		addFlagWithValue(flags, options.headlessOption.cliFlag, !headless);
	}

	addTrueBooleanFlagsIfChanged(flags, [
		booleanFlag(
			options.disableWebSecurityOption.cliFlag,
			disableWebSecurity,
			renderDefaults.disableWebSecurity,
		),
		booleanFlag(
			options.ignoreCertificateErrorsOption.cliFlag,
			ignoreCertificateErrors,
			renderDefaults.ignoreCertificateErrors,
		),
		booleanFlag(
			options.enableMultiprocessOnLinuxOption.cliFlag,
			multiProcessOnLinux,
			renderDefaults.multiProcessOnLinux,
		),
		booleanFlag(
			options.darkModeOption.cliFlag,
			darkMode,
			renderDefaults.darkMode,
		),
		booleanFlag(
			options.beepOnFinishOption.cliFlag,
			beepOnFinish,
			renderDefaults.beepOnFinish,
		),
	]);

	if (isStillRender) {
		addValueFlagsIfChanged(flags, [
			valueFlag(options.stillFrameOption.cliFlag, frame, 0),
			valueFlag(
				options.stillImageFormatOption.cliFlag,
				stillImageFormat,
				renderDefaults.stillImageFormat,
			),
			valueFlag(
				options.jpegQualityOption.cliFlag,
				jpegQuality,
				renderDefaults.jpegQuality,
			),
		]);
	} else {
		addValueFlagsIfChanged(flags, [
			valueFlag(
				options.concurrencyOption.cliFlag,
				concurrency,
				renderDefaults.concurrency,
			),
		]);

		if (isSequenceRender) {
			addBooleanFlag(flags, options.imageSequenceOption.cliFlag, true);
			if (sequenceImageFormat !== 'jpeg') {
				addFlagWithValue(
					flags,
					options.videoImageFormatOption.cliFlag,
					sequenceImageFormat,
				);
			}
		} else {
			addValueFlagsIfChanged(flags, [
				valueFlag(
					options.videoImageFormatOption.cliFlag,
					videoImageFormat,
					renderDefaults.videoImageFormat,
				),
				renderMediaValueFlag(
					'hardwareAcceleration',
					hardwareAcceleration,
					renderDefaults.hardwareAcceleration,
				),
			]);
		}

		if (hasCodecSpecificOptions && codec !== renderDefaults.codec) {
			addFlagWithValue(flags, getRenderMediaFlag('codec'), codec);
		}

		if (startFrame !== 0 || endFrame !== durationInFrames - 1) {
			addFlagWithValue(
				flags,
				options.framesOption.cliFlag,
				`${startFrame}-${endFrame}`,
			);
		}

		if (hasCodecSpecificOptions) {
			addTrueBooleanFlagsIfChanged(flags, [
				renderMediaBooleanFlag('muted', muted, renderDefaults.muted),
				booleanFlag(
					options.enforceAudioOption.cliFlag,
					enforceAudioTrack,
					renderDefaults.enforceAudioTrack,
				),
				renderMediaBooleanFlag(
					'forSeamlessAacConcatenation',
					forSeamlessAacConcatenation,
					renderDefaults.forSeamlessAacConcatenation,
				),
			]);

			addValueFlagsIfChanged(flags, [
				valueFlag(
					options.pixelFormatOption.cliFlag,
					pixelFormat,
					renderDefaults.pixelFormat,
				),
				renderMediaValueFlag(
					'colorSpace',
					colorSpace,
					renderDefaults.colorSpace,
				),
				valueFlag(
					options.proResProfileOption.cliFlag,
					proResProfile,
					renderDefaults.proResProfile,
				),
				renderMediaValueFlag(
					'x264Preset',
					x264Preset,
					renderDefaults.x264Preset,
				),
				valueFlag(options.crfOption.cliFlag, crf, null),
				valueFlag(
					options.jpegQualityOption.cliFlag,
					jpegQuality,
					renderDefaults.jpegQuality,
				),
				renderMediaValueFlag(
					'videoBitrate',
					videoBitrate,
					renderDefaults.videoBitrate,
				),
				renderMediaValueFlag(
					'audioBitrate',
					audioBitrate,
					renderDefaults.audioBitrate,
				),
				valueFlag(
					options.everyNthFrameOption.cliFlag,
					everyNthFrame,
					renderDefaults.everyNthFrame,
				),
				renderMediaValueFlag(
					'numberOfGifLoops',
					numberOfGifLoops,
					renderDefaults.numberOfGifLoops,
				),
				renderMediaValueFlag(
					'encodingBufferSize',
					encodingBufferSize,
					renderDefaults.encodingBufferSize,
				),
				renderMediaValueFlag(
					'encodingMaxRate',
					encodingMaxRate,
					renderDefaults.encodingMaxRate,
				),
				renderMediaValueFlag('separateAudioTo', separateAudioTo, null),
			]);

			const defaultAudioCodec = BrowserSafeApis.defaultAudioCodecs[
				codec as keyof typeof BrowserSafeApis.defaultAudioCodecs
			]?.compressed as string | undefined;
			if (audioCodec !== defaultAudioCodec) {
				addFlagWithValue(flags, getRenderMediaFlag('audioCodec'), audioCodec);
			}
		}

		addTrueBooleanFlagsIfChanged(flags, [
			renderMediaBooleanFlag(
				'disallowParallelEncoding',
				disallowParallelEncoding,
				false,
			),
			renderMediaBooleanFlag('repro', repro, renderDefaults.repro),
		]);
	}

	if (metadata) {
		for (const [key, value] of Object.entries(metadata)) {
			addFlagWithValue(
				flags,
				options.metadataOption.cliFlag,
				`${key}=${value}`,
			);
		}
	}

	if (Object.keys(inputProps).length > 0) {
		addFlagWithValue(
			flags,
			options.propsOption.cliFlag,
			JSON.stringify(inputProps),
		);
	}

	const envArgs = Object.entries(envVariables)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => shellQuote(`${key}=${value}`));

	const renderCommand = [
		command,
		commandType,
		shellQuote(serveUrl),
		shellQuote(compositionId),
		shellQuote(trimDefaultOutPrefix(outName)),
		...flags,
	].join(' ');

	if (envArgs.length === 0) {
		return renderCommand;
	}

	return ['env', ...envArgs, renderCommand].join(' ');
};
