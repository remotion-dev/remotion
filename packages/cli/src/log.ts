/* eslint-disable no-console */
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {truthy} from './truthy';

export const INDENT_TOKEN = '│';

export const Log = {
	verbose: (...args: Parameters<typeof console.log>) => {
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'verbose'
			)
		) {
			return console.log(...args.map((a) => chalk.blueBright(a)));
		}
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
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'info'
			)
		) {
			return console.log(...args);
		}
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
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'warn'
			)
		) {
			return console.warn(...args.map((a) => chalk.yellow(a)));
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
