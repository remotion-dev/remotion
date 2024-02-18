import type {ChromiumOptions, FrameRange, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {Log} from './log';

const getAndValidateFrameRange = (logLevel: LogLevel, indent: boolean) => {
	const frameRange = ConfigInternals.getRange();
	if (typeof frameRange === 'number') {
		Log.warn(
			{logLevel, indent},
			'Selected a single frame. Assuming you want to output an image.',
		);
		Log.warn(
			{logLevel, indent},
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`,
		);
		Log.warn(
			{indent, logLevel},
			"To dismiss this message, add the '--sequence' flag explicitly.",
		);
	}

	return frameRange;
};

export const getAndValidateAbsoluteOutputFile = (
	relativeOutputLocation: string,
	overwrite: boolean,
) => {
	const absoluteOutputFile = path.resolve(
		process.cwd(),
		relativeOutputLocation,
	);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.error(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`,
		);
		process.exit(1);
	}

	return absoluteOutputFile;
};

const getAndValidateShouldOutputImageSequence = ({
	frameRange,
}: {
	frameRange: FrameRange | null;
}) => {
	const shouldOutputImageSequence =
		ConfigInternals.getShouldOutputImageSequence(frameRange);

	return shouldOutputImageSequence;
};

const getProResProfile = () => {
	const proResProfile = ConfigInternals.getProResProfile();

	return proResProfile;
};

export const getCliOptions = (options: {
	isLambda: boolean;
	type: 'still' | 'series' | 'get-compositions';
	remotionRoot: string;
	logLevel: LogLevel;
}) => {
	const frameRange = getAndValidateFrameRange(options.logLevel, false);

	const shouldOutputImageSequence =
		options.type === 'still'
			? true
			: getAndValidateShouldOutputImageSequence({
					frameRange,
				});

	const overwrite = ConfigInternals.getShouldOverwrite({
		defaultValue: !options.isLambda,
	});
	const encodingBufferSize = ConfigInternals.getEncodingBufferSize();
	const encodingMaxRate = ConfigInternals.getEncodingMaxRate();
	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = getProResProfile();
	const browserExecutable = ConfigInternals.getBrowserExecutable();

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity: ConfigInternals.getChromiumDisableWebSecurity(),
		ignoreCertificateErrors: ConfigInternals.getIgnoreCertificateErrors(),
		headless: ConfigInternals.getChromiumHeadlessMode(),
		gl:
			ConfigInternals.getChromiumOpenGlRenderer() ??
			RenderInternals.DEFAULT_OPENGL_RENDERER,
		userAgent: ConfigInternals.getChromiumUserAgent(),
		enableMultiProcessOnLinux: ConfigInternals.getChromiumMultiProcessOnLinux(),
	};
	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const numberOfGifLoops = ConfigInternals.getNumberOfGifLoops();

	const concurrency = ConfigInternals.getConcurrency();

	const height = ConfigInternals.getHeight();
	const width = ConfigInternals.getWidth();

	RenderInternals.validateConcurrency({
		value: concurrency,
		setting: 'concurrency',
		checkIfValidForCurrentMachine: false,
	});

	return {
		puppeteerTimeout: ConfigInternals.getCurrentPuppeteerTimeout(),
		concurrency,
		frameRange,
		shouldOutputImageSequence,
		inputProps: getInputProps(null, options.logLevel),
		envVariables: getEnvironmentVariables(null, options.logLevel, false),
		pixelFormat,
		proResProfile,
		everyNthFrame,
		numberOfGifLoops,
		stillFrame: ConfigInternals.getStillFrame(),
		browserExecutable,
		logLevel: ConfigInternals.Logging.getLogLevel(),
		chromiumOptions,
		overwrite,
		muted: ConfigInternals.getMuted(),
		publicDir: ConfigInternals.getPublicDir(),
		ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
		encodingBufferSize,
		encodingMaxRate,
		height,
		width,
		configFileImageFormat: ConfigInternals.getUserPreferredVideoImageFormat(),
		deleteAfter: ConfigInternals.getDeleteAfter(),
		colorSpace: ConfigInternals.getColorSpace(),
		repro: ConfigInternals.getRepro(),
	};
};
