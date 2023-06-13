import {chalk} from './chalk';
import {isColorSupported} from './chalk/is-color-supported';
import type {LogLevel} from './log-level';
import {isEqualOrBelowLogLevel} from './log-level';
import {truthy} from './truthy';

export const INDENT_TOKEN = chalk.gray('│');

type LogOptions = {
	indent: boolean;
	logLevel: LogLevel;
};

type VerboseLogOptions = LogOptions & {
	tag?: string;
	secondTag?: string;
};

export const verboseTag = (str: string) => {
	return isColorSupported ? chalk.bgBlack(` ${str} `) : `[${str}]`;
};

export const secondverboseTag = (str: string) => {
	return isColorSupported ? chalk.bgWhite(` ${str} `) : `[${str}]`;
};

export const Log = {
	verbose: (...args: Parameters<typeof console.log>) => {
		Log.verboseAdvanced({indent: false, logLevel: getLogLevel()}, ...args);
	},
	verboseAdvanced: (
		options: VerboseLogOptions,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(options.logLevel, 'verbose')) {
			return console.log(
				...[
					options.indent ? INDENT_TOKEN : null,
					[
						options.tag ? verboseTag(options.tag) : null,
						options.secondTag ? secondverboseTag(options.secondTag) : null,
					]
						.filter(truthy)
						.join(''),
					...args.map((a) => chalk.gray(a)),
				].filter(truthy)
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
		if (isEqualOrBelowLogLevel(options.logLevel, 'info')) {
			return console.log(
				...[options.indent ? INDENT_TOKEN : null, ...args].filter(truthy)
			);
		}
	},
	warn: (...args: Parameters<typeof console.log>) => {
		Log.warnAdvanced({indent: false, logLevel: getLogLevel()}, ...args);
	},
	warnAdvanced: (
		options: LogOptions,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(options.logLevel, 'warn')) {
			return console.warn(
				...[
					options.indent ? chalk.yellow(INDENT_TOKEN) : null,
					...args.map((a) => chalk.yellow(a)),
				].filter(truthy)
			);
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(getLogLevel(), 'error')) {
			return console.error(...args.map((a) => chalk.red(a)));
		}
	},
};

let logLevel: LogLevel = 'info';

export const getLogLevel = () => {
	return logLevel;
};

export const setLogLevel = (newLogLevel: LogLevel) => {
	logLevel = newLogLevel;
};
