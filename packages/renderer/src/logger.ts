export const log = (tag: string, message: string) => {
	console.log(message);
};

import {chalk} from './chalk';
import type {LogLevel} from './log-level';
import {isEqualOrBelowLogLevel} from './log-level';
import {truthy} from './truthy';

export const INDENT_TOKEN = chalk.gray('│');

export const Log = {
	verbose: (...args: Parameters<typeof console.log>) => {
		Log.verboseAdvanced(
			{indent: false, logLevel: ConfigInternals.Logging.getLogLevel()},
			...args
		);
	},
	verboseAdvanced: (
		options: {indent: boolean; logLevel: LogLevel},
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(options.logLevel, 'verbose')) {
			return console.log(
				...[
					options.indent ? INDENT_TOKEN : null,
					...args.map((a) => chalk.blueBright(a)),
				].filter(truthy)
			);
		}
	},
	info: (...args: Parameters<typeof console.log>) => {
		Log.infoAdvanced(
			{indent: false, logLevel: ConfigInternals.Logging.getLogLevel()},
			...args
		);
	},
	infoAdvanced: (
		options: {indent: boolean; logLevel: LogLevel},
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(options.logLevel, 'info')) {
			return console.log(
				...[options.indent ? INDENT_TOKEN : null, ...args].filter(truthy)
			);
		}
	},
	warn: (...args: Parameters<typeof console.log>) => {
		Log.warnAdvanced(
			{indent: false, logLevel: ConfigInternals.Logging.getLogLevel()},
			...args
		);
	},
	warnAdvanced: (
		options: {indent: boolean; logLevel: LogLevel},
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
		if (
			isEqualOrBelowLogLevel(ConfigInternals.Logging.getLogLevel(), 'error')
		) {
			return console.error(...args.map((a) => chalk.red(a)));
		}
	},
};
