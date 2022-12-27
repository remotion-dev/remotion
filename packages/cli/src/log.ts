/* eslint-disable no-console */
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {truthy} from './truthy';

export const INDENT_TOKEN = '│';

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
		if (RenderInternals.isEqualOrBelowLogLevel(options.logLevel, 'verbose')) {
			return console.log(
				...[options.indent ? chalk.gray(INDENT_TOKEN) : null, ...args].filter(
					truthy
				)
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
		if (RenderInternals.isEqualOrBelowLogLevel(options.logLevel, 'info')) {
			return console.log(
				...[options.indent ? chalk.gray(INDENT_TOKEN) : null, ...args].filter(
					truthy
				)
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
		if (RenderInternals.isEqualOrBelowLogLevel(options.logLevel, 'warn')) {
			return console.warn(
				...[options.indent ? chalk.yellow(INDENT_TOKEN) : null, ...args].filter(
					truthy
				)
			);
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'error'
			)
		) {
			return console.error(...args.map((a) => chalk.red(a)));
		}
	},
};
