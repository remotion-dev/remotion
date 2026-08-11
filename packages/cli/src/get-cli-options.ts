import fs from 'node:fs';
import path from 'node:path';
import type {FfmpegOverrideFn, FrameRange, LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const getAndValidateFrameRange = (logLevel: LogLevel, indent: boolean) => {
	const frameSelection = BrowserSafeApis.options.framesOption.getValue({
		commandLine: parsedCli,
	}).value;
	const selectedFrames =
		typeof frameSelection === 'object' &&
		frameSelection !== null &&
		!Array.isArray(frameSelection)
			? frameSelection.frames
			: null;
	const frameRange: FrameRange | null =
		selectedFrames === null ? (frameSelection as FrameRange | null) : null;
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

	return {frameRange, selectedFrames};
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
}): {
	frameRange: FrameRange | null;
	selectedFrames: number[] | null;
	shouldOutputImageSequence: boolean;
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string>;
	stillFrame: number;
	ffmpegOverride: FfmpegOverrideFn;
} => {
	const {frameRange, selectedFrames} = getAndValidateFrameRange(
		options.logLevel,
		false,
	);

	const imageSequence = BrowserSafeApis.options.imageSequenceOption.getValue({
		commandLine: parsedCli,
	}).value;
	const shouldOutputImageSequence = options.isStill
		? true
		: imageSequence ||
			typeof frameRange === 'number' ||
			selectedFrames !== null;

	return {
		frameRange,
		selectedFrames,
		shouldOutputImageSequence,
		inputProps: getInputProps(null, options.logLevel),
		envVariables: getEnvironmentVariables(
			null,
			options.logLevel,
			options.indent,
		),
		stillFrame:
			BrowserSafeApis.options.stillFrameOption.getValue({
				commandLine: parsedCli,
			}).value ?? 0,
		ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
	};
};
