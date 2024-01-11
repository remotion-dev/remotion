import {chalk} from './chalk';
import {isColorSupported} from './chalk/is-color-supported';
import type {LogLevel} from './log-level';
import {isEqualOrBelowLogLevel} from './log-level';
import {getRepro, withRepro} from './repro';
import {truthy} from './truthy';

export const INDENT_TOKEN = chalk.gray('│');

export type LogOptions = {
	indent: boolean;
	logLevel: LogLevel;
};

type VerboseLogOptions = LogOptions & {
	tag?: string;
};

export const verboseTag = (str: string) => {
	return isColorSupported() ? chalk.bgBlack(` ${str} `) : `[${str}]`;
};

export const secondverboseTag = (str: string) => {
	return isColorSupported() ? chalk.bgWhite(` ${str} `) : `[${str}]`;
};

const LogInternal = {
	verbose: (
		options: VerboseLogOptions,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(options.logLevel, 'verbose')) {
			return console.log(
				...[
					options.indent ? INDENT_TOKEN : null,
					options.tag ? verboseTag(options.tag) : null,
				]
					.filter(truthy)
					.concat(args.map((a) => chalk.gray(a))),
			);
		}
	},
	info: (...args: Parameters<typeof console.log>) => {
		Log.infoAdvanced({indent: false, logLevel: getLogLevel()}, ...args);
	},
	infoAdvanced: (
		options: LogOptions,
		...args: Parameters<typeof console.log>
	) => {
		return console.log(
			...[options.indent ? INDENT_TOKEN : null].filter(truthy).concat(args),
		);
	},

	warn: (options: LogOptions, ...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(options.logLevel, 'warn')) {
			return console.warn(
				...[options.indent ? chalk.yellow(INDENT_TOKEN) : null]
					.filter(truthy)
					.concat(args.map((a) => chalk.yellow(a))),
			);
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(getLogLevel(), 'error')) {
			return console.error(...args.map((a) => chalk.red(a)));
		}
	},
	errorAdvanced: (
		options: VerboseLogOptions,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(getLogLevel(), 'error')) {
			return console.log(
				...[
					options.indent ? INDENT_TOKEN : null,
					options.tag ? verboseTag(options.tag) : null,
				]
					.filter(truthy)
					.concat(args.map((a) => chalk.red(a))),
			);
		}
	},
};

export type LogInstance = typeof LogInternal;

export const Log = getRepro() ? withRepro(LogInternal) : LogInternal;

let logLevel: LogLevel = 'info';

export const getLogLevel = () => {
	return logLevel;
};

export const setLogLevel = (newLogLevel: LogLevel) => {
	logLevel = newLogLevel;
};
