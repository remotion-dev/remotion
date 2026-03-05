import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderDefaults} from '@remotion/studio-shared';
import type {_InternalTypes} from 'remotion';

type RenderMode = 'still' | 'video' | 'audio' | 'sequence';

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

export const getNpmRemotionCommandPrefix = (version: string) => {
	return version.trim() === ''
		? 'npx -p @remotion/cli remotion'
		: `npx -p @remotion/cli@${version} remotion`;
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

export const makeReadOnlyStudioRenderCommand = ({
	remotionVersion,
	locationHref,
	compositionId,
	renderMode,
	renderDefaults,
	durationInFrames,
	frame,
	startFrame,
	endFrame,
	stillImageFormat,
	sequenceImageFormat,
	videoImageFormat,
	codec,
	muted,
	enforceAudioTrack,
	proResProfile,
	x264Preset,
	pixelFormat,
	colorSpace,
	scale,
	logLevel,
	delayRenderTimeout,
	hardwareAcceleration,
	chromeMode,
	inputProps,
}: {
	remotionVersion: string;
	locationHref: string;
	compositionId: string;
	renderMode: RenderMode;
	renderDefaults: RenderDefaults;
	durationInFrames: number;
	frame: number;
	startFrame: number;
	endFrame: number;
	stillImageFormat: string;
	sequenceImageFormat: string;
	videoImageFormat: string;
	codec: string;
	muted: boolean;
	enforceAudioTrack: boolean;
	proResProfile: _InternalTypes['ProResProfile'] | null;
	x264Preset: string | null;
	pixelFormat: string;
	colorSpace: string;
	scale: number;
	logLevel: string;
	delayRenderTimeout: number;
	hardwareAcceleration: string;
	chromeMode: string;
	inputProps: Record<string, unknown>;
}) => {
	const serveUrl = normalizeServeUrlForRenderCommand({
		locationHref,
		compositionId,
	});
	const commandType = renderMode === 'still' ? 'still' : 'render';
	const command = getNpmRemotionCommandPrefix(remotionVersion);
	const {options} = BrowserSafeApis;
	const flags: string[] = [];

	if (scale !== renderDefaults.scale) {
		addFlagWithValue(flags, options.scaleOption.cliFlag, scale);
	}

	if (logLevel !== renderDefaults.logLevel) {
		addFlagWithValue(flags, options.logLevelOption.cliFlag, logLevel);
	}

	if (delayRenderTimeout !== renderDefaults.delayRenderTimeout) {
		addFlagWithValue(
			flags,
			options.delayRenderTimeoutInMillisecondsOption.cliFlag,
			delayRenderTimeout,
		);
	}

	if (hardwareAcceleration !== renderDefaults.hardwareAcceleration) {
		addFlagWithValue(
			flags,
			options.hardwareAccelerationOption.cliFlag,
			hardwareAcceleration,
		);
	}

	if (chromeMode !== renderDefaults.chromeMode) {
		addFlagWithValue(flags, options.chromeModeOption.cliFlag, chromeMode);
	}

	if (renderMode === 'still') {
		if (frame !== 0) {
			addFlagWithValue(flags, options.stillFrameOption.cliFlag, frame);
		}

		if (stillImageFormat !== renderDefaults.stillImageFormat) {
			addFlagWithValue(
				flags,
				options.stillImageFormatOption.cliFlag,
				stillImageFormat,
			);
		}
	} else {
		if (renderMode === 'sequence') {
			addBooleanFlag(flags, options.imageSequenceOption.cliFlag, true);
			if (sequenceImageFormat !== 'jpeg') {
				addFlagWithValue(
					flags,
					options.videoImageFormatOption.cliFlag,
					sequenceImageFormat,
				);
			}
		} else if (videoImageFormat !== renderDefaults.videoImageFormat) {
			addFlagWithValue(
				flags,
				options.videoImageFormatOption.cliFlag,
				videoImageFormat,
			);
		}

		if (codec !== renderDefaults.codec) {
			addFlagWithValue(flags, options.videoCodecOption.cliFlag, codec);
		}

		if (startFrame !== 0 || endFrame !== durationInFrames - 1) {
			addFlagWithValue(
				flags,
				options.framesOption.cliFlag,
				`${startFrame}-${endFrame}`,
			);
		}

		if (muted && muted !== renderDefaults.muted) {
			addBooleanFlag(flags, options.mutedOption.cliFlag, true);
		}

		if (
			enforceAudioTrack &&
			enforceAudioTrack !== renderDefaults.enforceAudioTrack
		) {
			addBooleanFlag(flags, options.enforceAudioOption.cliFlag, true);
		}

		if (pixelFormat !== renderDefaults.pixelFormat) {
			addFlagWithValue(flags, options.pixelFormatOption.cliFlag, pixelFormat);
		}

		if (colorSpace !== renderDefaults.colorSpace) {
			addFlagWithValue(flags, options.colorSpaceOption.cliFlag, colorSpace);
		}

		if (proResProfile && proResProfile !== renderDefaults.proResProfile) {
			addFlagWithValue(
				flags,
				options.proResProfileOption.cliFlag,
				proResProfile,
			);
		}

		if (x264Preset && x264Preset !== renderDefaults.x264Preset) {
			addFlagWithValue(flags, options.x264Option.cliFlag, x264Preset);
		}
	}

	if (Object.keys(inputProps).length > 0) {
		addFlagWithValue(
			flags,
			options.propsOption.cliFlag,
			JSON.stringify(inputProps),
		);
	}

	return [
		command,
		commandType,
		shellQuote(serveUrl),
		shellQuote(compositionId),
		...flags,
	].join(' ');
};
