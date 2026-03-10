import fs from 'node:fs';
import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {Log} from './log';
import type {ParsedCommandLine} from './parsed-cli';
import {parsedCli} from './parsed-cli';

const getAndValidateFrameRange = (
	logLevel: LogLevel,
	indent: boolean,
	commandLine: ParsedCommandLine,
) => {
	const frameRange = BrowserSafeApis.options.framesOption.getValue({
		commandLine,
	}).value;
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

export const getCliOptions = (options: {
	isStill: boolean;
	logLevel: LogLevel;
	indent: boolean;
	commandLine?: ParsedCommandLine;
	remotionRoot?: string;
}) => {
	const commandLine = options.commandLine ?? parsedCli;
	const frameRange = getAndValidateFrameRange(
		options.logLevel,
		false,
		commandLine,
	);

	const imageSequence = BrowserSafeApis.options.imageSequenceOption.getValue({
		commandLine,
	}).value;
	const shouldOutputImageSequence = options.isStill
		? true
		: imageSequence || typeof frameRange === 'number';

	return {
		frameRange,
		shouldOutputImageSequence,
		inputProps: getInputProps(null, options.logLevel, commandLine),
		envVariables: getEnvironmentVariables(
			null,
			options.logLevel,
			options.indent,
			{commandLine, remotionRoot: options.remotionRoot},
		),
		stillFrame:
			BrowserSafeApis.options.stillFrameOption.getValue({
				commandLine,
			}).value ?? 0,
		ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
	};
};
