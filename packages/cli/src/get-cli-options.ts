import type {LogLevel} from '@remotion/renderer';
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
	logLevel: LogLevel,
) => {
	const absoluteOutputFile = path.resolve(
		process.cwd(),
		relativeOutputLocation,
	);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.error(
			{indent: false, logLevel},
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`,
		);
		process.exit(1);
	}

	return absoluteOutputFile;
};

const getProResProfile = () => {
	const proResProfile = ConfigInternals.getProResProfile();

	return proResProfile;
};

export const getCliOptions = (options: {
	isStill: boolean;
	logLevel: LogLevel;
	indent: boolean;
}) => {
	const frameRange = getAndValidateFrameRange(options.logLevel, false);

	const shouldOutputImageSequence = options.isStill
		? true
		: ConfigInternals.getShouldOutputImageSequence(frameRange);

	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = getProResProfile();
	const browserExecutable = ConfigInternals.getBrowserExecutable();

	const disableWebSecurity = ConfigInternals.getChromiumDisableWebSecurity();
	const ignoreCertificateErrors = ConfigInternals.getIgnoreCertificateErrors();
	const userAgent = ConfigInternals.getChromiumUserAgent();

	const everyNthFrame = ConfigInternals.getEveryNthFrame();

	const concurrency = ConfigInternals.getConcurrency();

	const height = ConfigInternals.getHeight();
	const width = ConfigInternals.getWidth();

	RenderInternals.validateConcurrency({
		value: concurrency,
		setting: 'concurrency',
		checkIfValidForCurrentMachine: false,
	});

	return {
		concurrency,
		frameRange,
		shouldOutputImageSequence,
		inputProps: getInputProps(null, options.logLevel),
		envVariables: getEnvironmentVariables(
			null,
			options.logLevel,
			options.indent,
		),
		pixelFormat,
		proResProfile,
		everyNthFrame,
		stillFrame: ConfigInternals.getStillFrame(),
		browserExecutable,
		userAgent,
		disableWebSecurity,
		ignoreCertificateErrors,
		ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
		height,
		width,
		configFileImageFormat: ConfigInternals.getUserPreferredVideoImageFormat(),
	};
};
